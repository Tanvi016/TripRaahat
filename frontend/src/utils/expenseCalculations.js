/**
 * expenseCalculations.js — personal + group financial calculations.
 *
 * Derives everything from demoTrip data + trip state. No hardcoded financial
 * totals where calculation is possible.
 */

import { groupMembers, currentBookings, BUDGET, roomAssignments, sharedRoomCosts, recoveryPlans } from '../data/demoTrip.js';
import { INR } from './finance.js';

/**
 * Personal expenses for a single traveler.
 * Includes their personal bookings (flight, activity, etc.) plus their
 * share of any shared room costs.
 */
export function personalExpenses(memberId, state) {
  const member = groupMembers.find((m) => m.id === memberId);
  if (!member) return null;

  // Base personal spend: sum of bookings that belong to this traveler.
  // In the demo model, the affected traveler (Tanvi) bears the outbound
  // flight cost, and all group members share room costs.
  // For simplicity: each member "owns" a share of the trip's base bookings.
  const baseBookingsTotal = Object.values(currentBookings).reduce((sum, b) => sum + (b.price || 0), 0);

  // Room cost share: if the member is assigned to shared rooms, split those costs.
  let roomShare = 0;
  if (roomAssignments && sharedRoomCosts) {
    for (const [roomId, roomData] of Object.entries(roomAssignments)) {
      const occupantIds = Array.isArray(roomData) ? roomData : roomData?.occupants || [];
      if (occupantIds.includes(memberId) && sharedRoomCosts[roomId]) {
        const splitCount = occupantIds.length;
        roomShare += (sharedRoomCosts[roomId] || 0) / splitCount;
      }
    }
  }

  // Personal bookings (flight, activity, personal items)
  // In the demo: all members share trip costs equally for simplicity,
  // but in production this would be per-member booking data.
  const personalBase = baseBookingsTotal / groupMembers.length;

  // Recovery cost: if there's an applied plan, the affected member bears
  // the extra cost (or split per group strategy).
  let recoveryCost = 0;
  if (state.appliedPlanId) {
    const plan = recoveryPlans.find((p) => p.id === state.appliedPlanId);
    if (plan) {
      recoveryCost = plan.extraCost || 0;
      // In the demo, the affected traveler pays the recovery extra cost.
      // In production, this would follow the group strategy allocation.
    }
  }

  const totalPersonal = personalBase + roomShare + recoveryCost;

  return {
    memberId: member.id,
    memberName: member.name,
    personalBase: Math.round(personalBase),
    roomShare: Math.round(roomShare),
    recoveryCost: Math.round(recoveryCost),
    total: Math.round(totalPersonal),
    bookings: currentBookings,
  };
}

/**
 * Room assignment summary — who shares which room, and the cost breakdown.
 */
export function roomAssignmentSummary() {
  if (!roomAssignments || !sharedRoomCosts) {
    return { rooms: [], totalRoomCost: 0 };
  }

  const rooms = Object.entries(roomAssignments).map(([roomId, roomData]) => {
    const occupantIds = Array.isArray(roomData) ? roomData : roomData?.occupants || [];
    const cost = sharedRoomCosts[roomId] || 0;
    const perPerson = occupantIds.length > 0 ? cost / occupantIds.length : 0;
    const occupantNames = occupantIds
      .map((id) => groupMembers.find((m) => m.id === id)?.name || id)
      .filter(Boolean);

    return {
      roomId,
      occupants: occupantNames,
      occupantIds,
      totalCost: cost,
      perPerson: Math.round(perPerson),
      splitCount: occupantIds.length,
    };
  });

  const totalRoomCost = Object.values(sharedRoomCosts).reduce((sum, c) => sum + c, 0);

  return { rooms, totalRoomCost };
}

/**
 * Settlement matrix — who owes whom.
 *
 * Net balance = what they paid − what they should pay.
 * Positive = others owe them. Negative = they owe others.
 *
 * In the demo model:
 *  - All members pay an equal share of the base trip cost.
 *  - The affected traveler (Tanvi) pays the recovery extra cost.
 *  - Room costs are split per room assignment.
 */
export function settlementMatrix(state) {
  const members = groupMembers;
  const baseBookingsTotal = Object.values(currentBookings).reduce((sum, b) => sum + (b.price || 0), 0);

  // Per-member "should pay" calculation
  const shouldPay = {};
  const paid = {};

  members.forEach((m) => {
    // Equal share of base bookings
    const baseShare = baseBookingsTotal / members.length;

    // Room cost share
    let roomShare = 0;
    if (roomAssignments && sharedRoomCosts) {
      for (const [roomId, roomData] of Object.entries(roomAssignments)) {
        const occupantIds = Array.isArray(roomData) ? roomData : roomData?.occupants || [];
        if (occupantIds.includes(m.id) && sharedRoomCosts[roomId]) {
          roomShare += (sharedRoomCosts[roomId] || 0) / occupantIds.length;
        }
      }
    }

    // Recovery cost: affected traveler pays the extra
    let recoveryShare = 0;
    if (state.appliedPlanId && m.affected) {
      const plan = recoveryPlans.find((p) => p.id === state.appliedPlanId);
      if (plan) {
        recoveryShare = plan.extraCost || 0;
      }
    }

    shouldPay[m.id] = Math.round(baseShare + roomShare + recoveryShare);
    paid[m.id] = Math.round(baseShare + roomShare); // what they "paid" (base + room share)
  });

  // Net balance = paid − shouldPay
  const netBalance = {};
  members.forEach((m) => {
    netBalance[m.id] = paid[m.id] - shouldPay[m.id];
  });

  // Settlement pairs: who owes whom
  const debtors = members.filter((m) => netBalance[m.id] < 0);
  const creditors = members.filter((m) => netBalance[m.id] > 0);

  const settlements = [];
  // Simple pairwise settlement: each debtor pays each creditor proportionally
  // In the demo, only Tanvi is affected (negative balance), others are creditors.
  for (const debtor of debtors) {
    for (const creditor of creditors) {
      const debtorDebt = Math.abs(netBalance[debtor.id]);
      const creditorCredit = netBalance[creditor.id];
      if (debtorDebt <= 0 || creditorCredit <= 0) continue;

      // Proportion: debtor's debt is split across creditors by their credit share
      const totalCredit = creditors.reduce((sum, c) => sum + Math.max(0, netBalance[c.id]), 0);
      if (totalCredit <= 0) continue;

      const amount = Math.min(
        debtorDebt * (creditorCredit / totalCredit),
        creditorCredit
      );

      if (amount > 0) {
        settlements.push({
          from: debtor.id,
          fromName: debtor.name,
          to: creditor.id,
          toName: creditor.name,
          amount: Math.round(amount),
        });
      }
    }
  }

  // Grand total check: sum of all net balances should be 0
  const sumNet = members.reduce((sum, m) => sum + netBalance[m.id], 0);

  return {
    members: members.map((m) => ({
      id: m.id,
      name: m.name,
      affected: m.affected,
      paid: paid[m.id],
      shouldPay: shouldPay[m.id],
      netBalance: netBalance[m.id],
      status: netBalance[m.id] > 0 ? 'owed' : netBalance[m.id] < 0 ? 'owes' : 'settled',
    })),
    settlements,
    sumNet: Math.round(sumNet),
    totalPaid: members.reduce((sum, m) => sum + paid[m.id], 0),
    totalShouldPay: members.reduce((sum, m) => sum + shouldPay[m.id], 0),
  };
}

/**
 * Group master ledger — combined view of room costs, personal expenses,
 * recovery costs, and settlement.
 */
export function groupMasterLedger(state) {
  const roomSummary = roomAssignmentSummary();
  const settlement = settlementMatrix(state);

  // Per-member personal expenses
  const expenses = {};
  groupMembers.forEach((m) => {
    expenses[m.id] = personalExpenses(m.id, state);
  });

  return {
    rooms: roomSummary.rooms,
    roomSummary,
    totalRoomCost: roomSummary.totalRoomCost,
    members: settlement.members,
    settlements: settlement.settlements,
    settlement,
    expenses,
    groupBudget: BUDGET,
    totalBookings: Object.values(currentBookings).reduce((sum, b) => sum + (b.price || 0), 0),
    affectedCount: groupMembers.filter((m) => m.affected).length,
    continuingCount: groupMembers.filter((m) => !m.affected).length,
  };
}
