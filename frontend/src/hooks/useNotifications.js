import toast from 'react-hot-toast';
export default function useNotifications() {
  return {
    success: m => toast.success(m), error: m => toast.error(m),
    info: m => toast(m, { icon: 'ℹ️' }),
    achievement: t => toast(`Achievement unlocked: ${t}`, { icon: '🏆', duration: 5000 }),
  };
}
