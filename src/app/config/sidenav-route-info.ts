// rounting info
import { NavigationItem } from '../interfaces/navigation-item.interface';
export const SIDENAV_ROUTE_INFO: NavigationItem[] = [
  // dashboard
  {
    type: 'subheading',
    label: 'CORPORATION',
    children: [
      {
        type: 'link',
        label: 'Info',
        route: '/information',
        icon: 'dashboard',
        // isAdmin: true
      },
      {
        type: 'link',
        label: 'Holiday Management',
        route: '/holiday',
        icon: 'today',
        // isAdmin: true
      },
    ],
  },
  // dashboard
  // company
  {
    type: 'subheading',
    label: 'Employee',
    children: [
      {
        type: 'link',
        label: 'Employee',
        route: '/employee/',
        icon: 'groups',
        isAdmin: true,
      },
      {
        type: 'link',
        label: 'Manager',
        route: '/manager/',
        icon: 'supervisor_account',
        isAdmin: true,
      },
      {
        type: 'link',
        label: 'Retire Employee',
        route: '/retire-employee/',
        icon: 'work_off',
        isAdmin: true,
      },
      {
        type: 'link',
        label: 'Retire Manager',
        route: '/retire-manager/',
        icon: 'domain_disabled',
        isAdmin: true,
      },
      {
        type: 'link',
        label: 'Leave Status',
        route: '/leave-status/',
        icon: 'event_note',
        isAdmin: true,
      },
      {
        type: 'link',
        label: 'Log History',
        route: '/log-history/',
        icon: 'update',
        isAdmin: true,
      },
      // {
      //   type: 'link',
      //   label: 'Pay Stub',
      //   route: '/pay-stub/',
      //   icon: 'receipt_long',
      //   isAdmin: true,
      // },
      // {
      //   type: 'link',
      //   label: 'Contract',
      //   route: '/contract/',
      //   icon: 'update',
      //   isAdmin: true,
      // },
    ],
  },
  // EMPLOYEE
  // dashboard
  // company
  {
    type: 'subheading',
    label: 'Contract',
    children: [
      {
        type: 'link',
        label: 'Pay Stub',
        route: '/pay-stub/',
        icon: 'receipt_long',
        isAdmin: true,
      },
      {
        type: 'link',
        label: 'Contract',
        route: '/contract/',
        icon: 'update',
        isAdmin: true,
      },
    ],
  },

  {
    type: 'subheading',
    label: 'SPACE',
    children: [
      {
        type: 'link',
        label: 'Notification',
        route: '/notification',
        icon: 'campaign',
        isAdmin: true,
      },
      {
        type: 'link',
        label: 'Meeting Scheduler',
        route: '/meeting',
        icon: 'meeting_room',
        isAdmin: true,
      },
    ],
  },

  // // project
  // {
  // 	type: 'subheading',
  // 	label: 'project',
  // 	children: [
  // 	{
  // 		type: 'click',
  // 		label: 'Create space',
  // 		icon: 'create_new_folder'
  // 	},
  // 	{
  // 		type: 'dropdown',
  // 		label: 'Space',
  // 		icon: 'library_books',
  // 		isManager: false,
  // 		children: [

  // 		]
  // 	}
  // 	]
  // },

  // // Leave
  // {
  // 	type: 'subheading',
  // 	label: 'Leave ',
  // 	children: [
  // 	{
  // 		type: 'dropdown',
  // 		label: 'Leave Management',
  // 		icon: 'event_available',
  // 		isManager: false,
  // 		children: [
  // 		{
  // 			type: 'link',
  // 			label: 'My Leave Status',
  // 			route: '/leave/my-status',
  // 			icon: 'update',
  // 			isManager: false
  // 		},
  // 		{
  // 			type: 'link',
  // 			label: 'Request Leave',
  // 			route: '/leave/request-leave-list',
  // 			icon: 'update',
  // 			isManager: false
  // 		},
  // 		]
  // 	},

  // 	{
  // 		type: 'dropdown',
  // 		label: 'Employee Management',
  // 		icon: 'groups',
  // 		isManager: true,
  // 		children: [
  // 		{
  // 			type: 'link',
  // 			label: 'Employee Leave Status',
  // 			route: '/employee-mngmt/employee-leave-status',
  // 			icon: 'update',
  // 			isManager: true
  // 		},
  // 		{
  // 			type: 'link',
  // 			label: 'Employee List',
  // 			route: '/employee-mngmt/employee-list',
  // 			icon: 'update',
  // 			isManager: true
  // 		},
  // 		{
  // 			type: 'link',
  // 			label: 'Employee Leave Request',
  // 			route: '/approval-mngmt/leave-request',
  // 			icon: 'update',
  // 			isManager: true
  // 		},
  // 		{
  // 			type: 'link',
  // 			label: 'Employee Register Request',
  // 			route: '/employee-mngmt/register-request',
  // 			icon: 'update',
  // 			isManager: true
  // 		},
  // 		]
  // 	},
  // 	]
  // },
];
