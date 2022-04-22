import { useState, SetStateAction, Dispatch, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';

type SearchProps = {
  onInput?: any;
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  options?: string[];
  currentOption?: string;
  setCurrentOption?: Dispatch<SetStateAction<string>>;
  showDropdown?: boolean;
  className?: string;
};

type SearchDropdownProps = {
  options: string[];
  currentOption: string;
  setCurrentOption: Dispatch<SetStateAction<string>>;
};

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ');
}

export const SearchDropdown = ({ options, currentOption, setCurrentOption }: SearchDropdownProps) => {
  return (
    <Menu as='div' className='flex relative border-b-2 border-gray-500 pb-0 mt-auto'>
      <div>
        <Menu.Button className='inline-flex mt-auto justify-center items-center w-full px-4 pt-2 bg-transparent text-xs font-medium text-white'>
          {currentOption}
          <svg className='ml-4' width='13' height='8' viewBox='0 0 13 8' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path d='M6.01 7.425L12.02 1.415L10.607 0L6.01 4.6L1.414 0L0 1.414L6.01 7.425Z' fill='white' />
          </svg>
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter='transition ease-out duration-100'
        enterFrom='transform opacity-0 scale-95'
        enterTo='transform opacity-100 scale-100'
        leave='transition ease-in duration-75'
        leaveFrom='transform opacity-100 scale-100'
        leaveTo='transform opacity-0 scale-95'
      >
        <Menu.Items className='origin-top-right absolute text-left right-0 mt-12 w-56 rounded-md bg-white opacity-100 z-10'>
          <div className='bg-white rounded-md'>
            <h2 className='text-gray-400 ml-4 mt-2 mb-2 text-sm font-light'>Search</h2>
            {options.map(option => {
              return (
                <Menu.Item key={option}>
                  <div
                    onClick={() => setCurrentOption(option)}
                    className={classNames(
                      option === currentOption ? 'bg-gray-100 font-bold text-gradient-darkBlue' : 'font-light',
                      'block px-4 py-2 text-sm text-black rounded-md',
                    )}
                  >
                    {option}
                  </div>
                </Menu.Item>
              );
            })}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export const Search = ({
  onInput,
  options = [],
  currentOption = '',
  setCurrentOption = () => {},
  showDropdown = true,
  query,
  setQuery,
  className,
}: SearchProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // const onInputInternal = (event: ChangeEvent<HTMLInputElement>) => {
  //   console.log(event.target.value);
  //   setQuery(event.target.value);
  //   onInput && onInput(event.target.value);
  // };

  const handleXClick = () => {
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className={`flex ${className} mt-auto `}>
      <button className='' onClick={() => setIsOpen(!isOpen)}>
        <svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path
            d='M14.2939 12.5786H13.3905L13.0703 12.2699C14.191 10.9663 14.8656 9.27387 14.8656 7.43282C14.8656 3.32762 11.538 0 7.43282 0C3.32762 0 0 3.32762 0 7.43282C0 11.538 3.32762 14.8656 7.43282 14.8656C9.27387 14.8656 10.9663 14.191 12.2699 13.0703L12.5786 13.3905V14.2939L18.2962 20L20 18.2962L14.2939 12.5786ZM7.43282 12.5786C4.58548 12.5786 2.28702 10.2802 2.28702 7.43282C2.28702 4.58548 4.58548 2.28702 7.43282 2.28702C10.2802 2.28702 12.5786 4.58548 12.5786 7.43282C12.5786 10.2802 10.2802 12.5786 7.43282 12.5786Z'
            fill='white'
          />
        </svg>
      </button>
      {isOpen && (
        <div className='flex ml-4'>
          {showDropdown && (
            <SearchDropdown options={options} setCurrentOption={setCurrentOption} currentOption={currentOption} />
          )}
          <input
            type='text'
            placeholder='Search'
            value={query}
            onInput={onInput}
            className='appearance-none text-xs px-1 mt-auto pb-1 bg-transparent border-0 border-b-2 focus:ring-0 focus:ring-white placeholder-white'
            style={{ borderBottomColor: '#6B7280' }}
          />
          <button className='h-full border-b-2 px-1  border-gray-500' onClick={handleXClick}>
            <svg width='9' height='9' viewBox='0 0 9 9' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <path
                d='M8.5 0.805714L7.69429 0L4.5 3.19429L1.30571 0L0.5 0.805714L3.69429 4L0.5 7.19429L1.30571 8L4.5 4.80571L7.69429 8L8.5 7.19429L5.30571 4L8.5 0.805714Z'
                fill='white'
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};
