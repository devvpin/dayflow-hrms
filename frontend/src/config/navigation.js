export const employeeNavigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Profile', href: '/profile' },
  { name: 'Attendance', href: '/attendance' },
  { name: 'Leave', href: '/leave' },
  { name: 'Payroll', href: '/payroll' },
  { name: 'Notifications', href: '/notifications' }
];

export const adminNavigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Employees', href: '/admin/employees' },
  { name: 'Attendance', href: '/admin/attendance' },
  { name: 'Leave Requests', href: '/admin/leaves' },
  { name: 'Payroll', href: '/admin/payroll' },
  { name: 'Reports', href: '/admin/reports' },
  { name: 'Notifications', href: '/notifications' }
];

export const getNavigationByRole = (role) => {
  if (role === 'admin' || role === 'hr') {
    return adminNavigation;
  }
  return employeeNavigation; // default to employee
};
