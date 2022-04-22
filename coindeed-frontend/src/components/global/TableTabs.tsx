import { Dispatch, SetStateAction } from 'react';
import { useHistory } from 'react-router';

interface TableTabProps {
  tabs: string[];
  currentTab: string;
  setCurrentTab: Dispatch<SetStateAction<string>>;
}

export const TableTabs = ({ tabs, currentTab, setCurrentTab }: TableTabProps) => {
  const history = useHistory();
  return (
    <div className='flex space-x-3 justify-center'>
      {tabs.map(tab => {
        return (
          <div
            key={tab}
            onClick={() => {
              setCurrentTab(tab);
              history.push({
                search: `${tab === 'My Wholesales' || tab === 'My Deeds' ? '?type=my' : '?type=all'}`,
              });
            }}
            className={
              (currentTab === tab
                ? 'bg-blue-tabActive text-white border-white'
                : 'bg-tabInactive text-white-halfLight border-white-twoXLight') +
              ' rounded-t-md text-sm py-7 px-6 w-42 font-bold border-b-2 text-center cursor-pointer'
            }
          >
            {tab}
          </div>
        );
      })}
    </div>
  );
};
