// rounting info
import { NavigationItem } from '../interfaces/navigation-item.interface'
export const sidenavRouteInfo: NavigationItem[] = [

    // dashboard
    {
        type: 'link',
        label: 'Dashboard',
        route: '/main',
        icon: 'dashboard',
        // isNsAdmin: true
    },
    // company
    {
        type: 'subheading',
        label: 'COMPANY',
        children: [
            {
                type: 'link',
                label: 'Company List',
                route: '/company/',
                icon: 'update',
                isNsAdmin: true
            },
            {
                type: 'link',
                label: 'Company Holiday Management',
                route: '/company-holiday/',
                icon: 'groups',
                isNsAdmin: true
            },
        ]
    },
    // EMPLOYEE
    {
        type: 'subheading',
        label: 'EMPLOYEE',
        children: [
            {
                type: 'link',
                label: 'Employee List',
                route: '/employee/company-list',
                icon: 'holiday_village',
                isNsAdmin: true
            },
            {
                type: 'link',
                label: 'Employee Leave Status',
                route: '/employee/',
                icon: 'holiday_village',
                isNsAdmin: true
            },
            {
                type: 'link',
                label: 'Retired Employee List',
                route: '/employee/',
                icon: 'holiday_village',
                isNsAdmin: true
            },
        ]
    },
    {
        type: 'subheading',
        label: 'HOLIDAY MANAGEMENT',
        children: [
            {
                type: 'link',
                label: 'County List',
                route: '',
                icon: 'holiday_village',
                isNsAdmin: true
            },
        ]
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
