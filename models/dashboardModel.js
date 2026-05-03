const db = require('../config/db');

const Dashboard = {
  adminDashboard: async () => {
    try {
      const [users] = await db.execute(`SELECT COUNT(*) AS row_count FROM users`);

      let dashboardJson = [
        {
          users: users[0].row_count,
        }
      ]

      let dataJSON = {
        status: 'success',
        data: dashboardJson
      };
      return dataJSON;
    } catch (err) {
      throw err;
    }
  },
};

module.exports = Dashboard;