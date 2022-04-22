import { NavLink, NavLinkProps, useLocation } from 'react-router-dom';

interface Tab {
  name: string;
  current: boolean;
  route: NavLinkProps;
}

interface TabProps {
  tabs: Tab[];
}

export const Tabs = ({ tabs }: TabProps) => {
  const location = useLocation();
  return (
    <div>
      <div className='md:hidden px-4'>
        <label htmlFor='tabs' className='sr-only'>
          Select a tab
        </label>
        {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
        <select
          id='tabs'
          name='tabs'
          className='block w-full border-gray-300 rounded-md'
          defaultValue={tabs.find(tab => tab.current)?.name}
        >
          {tabs.map(tab => (
            <option key={tab.name}>{tab.name}</option>
          ))}
        </select>
      </div>

      <div className='hidden md:block'>
        <nav className='flex space-x-3 justify-center' aria-label='Tabs'>
          {tabs.map(tab => (
            <NavLink
              {...tab.route}
              key={tab.name}
              className={isActive =>
                (isActive || tab.current || (tab.route.to === '/deed' && location.pathname === '/')
                  ? 'bg-secondary bg-opacity-70'
                  : 'bg-tabInactive text-opacity-60 border-opacity-20') +
                ' w-32 px-6 py-2 font-bold text-sm rounded-t-lg text-center border-b-2 text-white border-white hover:text-white'
              }
              aria-current={tab.current ? 'page' : undefined}
            >
              {tab.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};
