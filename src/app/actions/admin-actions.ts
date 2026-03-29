'use server';

// Server action to get admin dashboard data (entry counts by user for a given date)
export async function getAdminDashboardDataAction(date: string) {
  try {
    const { getAdminEntryCountsByDate, getAllUsersFromDb } = await import('@/lib/pg-db');
    const [result, allUsers] = await Promise.all([
      getAdminEntryCountsByDate(date),
      getAllUsersFromDb()
    ]);

    // Build a unified table: start with all users from the DB
    const userMap = new Map<string, { tagCount: number; consumptionCount: number }>();

    // Only include users who are actually 'USER' (engineers), filter out 'ADMIN' if desired, but let's just include all users with a name
    for (const user of allUsers) {
      if (user.role === 'USER') {
        const displayName = user.name || user.email;
        userMap.set(displayName, { tagCount: 0, consumptionCount: 0 });
      }
    }

    for (const row of result.tagEntries) {
      const existing = userMap.get(row.user_name) || { tagCount: 0, consumptionCount: 0 };
      existing.tagCount = Number(row.count) || 0;
      userMap.set(row.user_name, existing);
    }

    for (const row of result.consumptionEntries) {
      const existing = userMap.get(row.user_name) || { tagCount: 0, consumptionCount: 0 };
      existing.consumptionCount = Number(row.count) || 0;
      userMap.set(row.user_name, existing);
    }

    // Convert to array sorted by user name
    const entries = Array.from(userMap.entries())
      .map(([userName, counts]) => ({
        userName,
        tagEntryCount: counts.tagCount,
        consumptionEntryCount: counts.consumptionCount,
      }))
      .sort((a, b) => a.userName.localeCompare(b.userName));

    // Calculate totals
    const totalTagEntries = entries.reduce((sum, e) => sum + e.tagEntryCount, 0);
    const totalConsumptionEntries = entries.reduce((sum, e) => sum + e.consumptionEntryCount, 0);

    return {
      success: true,
      data: {
        entries,
        totalTagEntries,
        totalConsumptionEntries,
      },
    };
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

// Server action to get all DC numbers (for admin export dropdown)
export async function getAdminDcNumbersAction() {
  try {
    const { getAllDcNumbers } = await import('@/lib/pg-db');
    const dcData = await getAllDcNumbers();
    const dcNumbers = dcData.map((d) => d.dcNumber);
    return {
      success: true,
      dcNumbers,
    };
  } catch (error) {
    console.error('Error fetching DC numbers for admin:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      dcNumbers: [],
    };
  }
}
