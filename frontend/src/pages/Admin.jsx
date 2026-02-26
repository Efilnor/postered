import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, ShoppingBag, Euro, ShieldCheck } from 'lucide-react';
import '../styles/Admin.css';

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem('token');

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data.stats);
      setUsers(res.data.users || []); 
    } catch (err) {
      console.error("Erreur chargement admin:", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleChangeRole = async (userId, currentRole) => {
    const newRole = currentRole === 'Admin' ? 'UserBuyer' : 'Admin';
    if (!window.confirm(`Confirmer le passage au rôle ${newRole} ?`)) return;

    try {
      await axios.put(`http://localhost:4000/api/admin/users/${userId}/role`, 
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData(); 
    } catch (err) {
      alert("Erreur lors du changement de rôle");
    }
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">Administration Globale</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <Users size={28} />
          <div><p>Utilisateurs</p><strong>{stats?.totalUsers || 0}</strong></div>
        </div>
        <div className="stat-card">
          <ShoppingBag size={28} />
          <div><p>Commandes</p><strong>{stats?.totalOrders || 0}</strong></div>
        </div>
        <div className="stat-card primary">
          <Euro size={28} />
          <div><p>Revenu Total</p><strong>{stats?.totalRevenue || 0} €</strong></div>
        </div>
      </div>

      <section className="users-section">
        <h2>Gestion des utilisateurs</h2>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Rôle</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users?.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info-cell">
                      <strong>{user.firstName} {user.lastName}</strong>
                      <span>{user.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge ${user.group?.name}`}>
                      {user.group?.name || 'User'}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleChangeRole(user.id, user.group?.name)}
                      className="btn-secondary"
                    >
                      <ShieldCheck size={18} /> 
                      {user.group?.name === 'Admin' ? 'Rétrograder' : 'Promouvoir Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Admin;