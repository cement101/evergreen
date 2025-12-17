import React, { useState } from 'react';
import { User, UserRole, Basin } from '../types';
import Button from './Button';
import { Trash2, UserPlus, Shield, ShieldAlert } from 'lucide-react';

interface Props {
  users: User[];
  allBasins: Basin[];
  onAddUser: (user: User) => void;
  onRemoveUser: (id: string) => void;
  onUpdateUser: (user: User) => void;
}

const UsersPage: React.FC<Props> = ({ users, allBasins, onAddUser, onRemoveUser, onUpdateUser }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({
    username: '',
    role: UserRole.USER,
    allowedBasins: []
  });

  const handleAdd = () => {
    if (newUser.username) {
      onAddUser({
        id: `u-${Date.now()}`,
        username: newUser.username,
        role: newUser.role as UserRole,
        allowedBasins: newUser.role === UserRole.ADMIN ? [] : (newUser.allowedBasins || [])
      });
      setNewUser({ username: '', role: UserRole.USER, allowedBasins: [] });
      setIsAdding(false);
    }
  };

  const toggleBasinPermission = (userId: string, basinId: string, currentBasins: string[]) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const newBasins = currentBasins.includes(basinId)
      ? currentBasins.filter(id => id !== basinId)
      : [...currentBasins, basinId];
      
    onUpdateUser({ ...user, allowedBasins: newBasins });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">User Management</h2>
            <p className="text-gray-500 text-sm mt-1">Superadmin Access Only</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} size="md">
            <UserPlus size={18} className="mr-2" /> Add User
        </Button>
      </div>

      {isAdding && (
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6 flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold mb-1 dark:text-gray-300">Username</label>
            <input 
              type="text" 
              value={newUser.username} 
              onChange={e => setNewUser({...newUser, username: e.target.value})}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 dark:text-gray-300">Role</label>
            <select 
              value={newUser.role}
              onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
              className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value={UserRole.USER}>User</option>
              <option value={UserRole.ADMIN}>Admin</option>
            </select>
          </div>
          <Button onClick={handleAdd}>Save User</Button>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Basin Access</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">
                  {user.username}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === UserRole.ADMIN 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {user.role === UserRole.ADMIN ? <ShieldAlert size={12} className="mr-1"/> : <Shield size={12} className="mr-1"/>}
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {user.role === UserRole.ADMIN ? (
                    <span className="text-gray-400 text-sm italic">Full System Access</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {allBasins.map(basin => (
                        <button
                          key={basin.id}
                          onClick={() => toggleBasinPermission(user.id, basin.id, user.allowedBasins)}
                          className={`text-xs px-2 py-1 rounded border transition-colors ${
                            user.allowedBasins.includes(basin.id)
                              ? 'bg-evergreen-50 border-evergreen-200 text-evergreen-700 dark:bg-evergreen-900/30 dark:border-evergreen-700 dark:text-evergreen-300'
                              : 'bg-white border-gray-200 text-gray-400 dark:bg-gray-800 dark:border-gray-600 opacity-60 hover:opacity-100'
                          }`}
                        >
                          {basin.name}
                        </button>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => onRemoveUser(user.id)}
                    className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Remove User"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersPage;
