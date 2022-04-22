import { Dispatch, SetStateAction, Fragment, useState } from 'react';
import { Dialog, Transition, RadioGroup } from '@headlessui/react';
import exit from '../../images/Exit.svg';
import '../../styles/_filter.scss';
import {
  ACTION_FILTER,
  STATUS_FILTER,
  DEED_TYPE_FILTER,
  LEVERAGE_FILTER,
  PUBLIC_WHOLESALE_FILTER,
  PRIVATE_WHOLESALE_FILTER,
  FilterNameAndValue,
} from '../../utils/Constants';
import { useDispatch, useSelector } from 'react-redux';

export interface FilterOptions {
  action?: string;
  status?: string;
  deedType?: string;
  leverage?: string;
  view?: string;
}

type FilterProps = {
  wholesale?: boolean;
  pub?: boolean;
  filterValues: FilterOptions;
  setFilterValues: Dispatch<SetStateAction<FilterOptions>>;
};

type FilterModalProps = {
  filterValues: FilterOptions;
  setFilterValues: Dispatch<SetStateAction<FilterOptions>>;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

type FilterWholesaleModalProps = {
  pub: boolean;
  filterValues: FilterOptions;
  setFilterValues: Dispatch<SetStateAction<FilterOptions>>;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

type FilterModalRadioGroupProps = {
  open?: boolean;
  filterValues: FilterOptions;
  setFilterValues: Dispatch<SetStateAction<FilterOptions>>;
  title: string;
  options: FilterNameAndValue[];
  selected: string;
  setSelected: Dispatch<SetStateAction<string>>;
};

const FilterModalRadioGroup = ({
  options,
  filterValues,
  setFilterValues,
  title,
  selected,
  setSelected,
  open,
}: FilterModalRadioGroupProps) => {
  function classNames(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
  }

  const radioGroupChanged = (value: any) => {
    const newFilterValues = { ...filterValues };
    if (ACTION_FILTER.find(element => element === value) !== undefined) {
      newFilterValues.action = value.value;
    } else if (STATUS_FILTER.find(element => element === value) !== undefined) {
      newFilterValues.status = value.value;
    } else if (DEED_TYPE_FILTER.find(element => element === value) !== undefined) {
      newFilterValues.deedType = value.value;
    } else if (LEVERAGE_FILTER.find(element => element === value) !== undefined) {
      newFilterValues.leverage = value.value;
    } else {
      newFilterValues.view = value.value;
    }
    setFilterValues(newFilterValues);
    setSelected(value.value);
  };

  return (
    <div className='flex flex-col'>
      <span className='text-gradient-darkBlue font-bold text-left'>{title}</span>
      <RadioGroup value={selected} onChange={radioGroupChanged}>
        <div className='text-xs rounded-md -space-y-px mr-4'>
          {options.map((option, optionIdx) => (
            <div className='' key={option.name}>
              <RadioGroup.Option
                value={option}
                className={() =>
                  classNames(
                    option.value === selected ? 'bg-red' : 'border-gray-200',
                    'relative flex cursor-pointer text-white py-1 items-center',
                  )
                }
              >
                <>
                  <span
                    className={classNames(
                      option.value === selected ? 'bg-indigo-600 border-transparent' : 'bg-white border-gray',
                      option.value === selected ? 'ring-2 ring-offset-2 ring-indigo-500' : '',
                      'h-2-5 w-2-5 cursor-pointer border flex items-center justify-center text-gray',
                    )}
                    aria-hidden='true'
                  >
                    <span className='bg-white w-1 h-1' />
                  </span>
                  <div className='ml-2 flex flex-col'>
                    <RadioGroup.Label as='span' className={classNames('block text-sm font-light text-gray')}>
                      {option.name}
                    </RadioGroup.Label>
                  </div>
                </>
              </RadioGroup.Option>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
};

const FilterModal = ({ open, setOpen, filterValues, setFilterValues }: FilterModalProps) => {
  let startingState1 = '';
  let startingState2 = '';
  let startingState3 = '';
  let startingState4 = '';

  if (filterValues.action !== '' && filterValues.action !== undefined) startingState1 = filterValues.action;
  if (filterValues.status !== '' && filterValues.status !== undefined) startingState2 = filterValues.status;
  if (filterValues.deedType !== '' && filterValues.deedType !== undefined) startingState3 = filterValues.deedType;
  if (filterValues.leverage !== '' && filterValues.leverage !== undefined) startingState4 = filterValues.leverage;

  const [selected1, setSelected1] = useState(startingState1);
  const [selected2, setSelected2] = useState(startingState2);
  const [selected3, setSelected3] = useState(startingState3);
  const [selected4, setSelected4] = useState(startingState4);
  const [tempFilterValues, setTempFilterValues] = useState(filterValues);

  const clearAll = () => {
    setSelected1('');
    setSelected2('');
    setSelected3('');
    setSelected4('');
    setTempFilterValues({ action: '', leverage: '', deedType: '', status: '' });
  };

  const apply = () => {
    setFilterValues({ ...tempFilterValues });
    setOpen(false);
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as='div' className='fixed z-10 inset-0 overflow-y-auto' onClose={setOpen}>
        <div className='block table-filter ml-auto mr-auto min-h-screen pt-4 px-4 pb-20 text-center md:px-0'>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <Dialog.Overlay className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className='hidden sm:inline-block sm:align-middle sm:h-screen' aria-hidden='true'>
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            enterTo='opacity-100 translate-y-0 sm:scale-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100 translate-y-0 sm:scale-100'
            leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
          >
            <div className='inline-block text-center align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-15'>
              <div className='hidden sm:block absolute top-0 right-0 pt-4 pr-4'>
                <button
                  type='button'
                  className='border border-white px-2 py-1 mt-1 rounded-md text-gray-400 hover:text-red-500'
                  onClick={() => setOpen(false)}
                >
                  <img src={exit} alt='close' />
                </button>
              </div>
              <h2 className='text-left mb-5 text-black font-thin'>Filter</h2>
              <div className='text-center'>
                <div className='grid grid-cols-2 mr-2-5 ml-2-5 mb-9'>
                  <FilterModalRadioGroup
                    selected={selected1}
                    setSelected={setSelected1}
                    setFilterValues={setTempFilterValues}
                    filterValues={tempFilterValues}
                    options={ACTION_FILTER}
                    title={'Action'}
                  />
                  <div className='ml-auto'>
                    <FilterModalRadioGroup
                      selected={selected3}
                      setSelected={setSelected3}
                      setFilterValues={setTempFilterValues}
                      filterValues={tempFilterValues}
                      options={DEED_TYPE_FILTER}
                      title={'Deed Type'}
                    />
                  </div>
                  <div className='mt-6'>
                    <FilterModalRadioGroup
                      selected={selected2}
                      setSelected={setSelected2}
                      setFilterValues={setTempFilterValues}
                      filterValues={tempFilterValues}
                      options={STATUS_FILTER}
                      title={'Status'}
                    />
                  </div>
                  <div className='ml-auto mt-6'>
                    <FilterModalRadioGroup
                      selected={selected4}
                      setSelected={setSelected4}
                      setFilterValues={setTempFilterValues}
                      filterValues={tempFilterValues}
                      options={LEVERAGE_FILTER}
                      title={'Leverage'}
                    />
                  </div>
                </div>
              </div>
              <div className='flex justify-center'>
                <button
                  className='mr-2 text-gradient-darkBlue bg-white-filterButton text-xs font-light px-5 py-2 rounded-md'
                  onClick={clearAll}
                >
                  Clear All
                </button>
                <button
                  className='ml-2 bg-gradient-darkBlue text-xs font-light text-white px-6 py-2 rounded-md'
                  onClick={() => apply()}
                >
                  Apply
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

const FilterWholesaleModal = ({ pub, open, setOpen, filterValues, setFilterValues }: FilterWholesaleModalProps) => {
  let startingState = '';
  if (filterValues.view !== '' && filterValues.view !== undefined) {
    startingState = filterValues.view;
  }
  const [selected1, setSelected1] = useState(startingState);
  const [tempFilterValues, setTempFilterValues] = useState(filterValues);

  const clearAll = () => {
    setSelected1('');
    setFilterValues({ view: '' });
    setTempFilterValues({ view: '' });
  };

  const filterOptions = pub ? PUBLIC_WHOLESALE_FILTER : PRIVATE_WHOLESALE_FILTER;

  const apply = () => {
    setFilterValues(tempFilterValues);
    setOpen(false);
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as='div' className='fixed z-10 inset-0 overflow-y-auto' onClose={setOpen}>
        <div className='block wholesale-table-filter ml-auto mr-auto min-h-screen pt-4 px-4 pb-20 text-center md:px-0'>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <Dialog.Overlay className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className='hidden sm:inline-block sm:align-middle sm:h-screen' aria-hidden='true'>
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
            enterTo='opacity-100 translate-y-0 sm:scale-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100 translate-y-0 sm:scale-100'
            leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
          >
            <div className='inline-block text-center align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-15'>
              <div className='hidden sm:block absolute top-0 right-0 pt-4 pr-4'>
                <button
                  type='button'
                  className='border border-white px-2 py-1 mt-1 rounded-md text-gray-400 hover:text-red-500'
                  onClick={() => setOpen(false)}
                >
                  <img src={exit} alt='close' />
                </button>
              </div>
              <h2 className='text-left mb-2-5 text-black font-thin'>Filter</h2>
              <div className='mb-7 text-center'>
                <div className='flex'>
                  <div className='flex flex-col'>
                    <FilterModalRadioGroup
                      open={open}
                      selected={selected1}
                      setSelected={setSelected1}
                      setFilterValues={setTempFilterValues}
                      filterValues={tempFilterValues}
                      options={filterOptions}
                      title={'View'}
                    />
                  </div>
                </div>
              </div>
              <div className='flex justify-center'>
                <button
                  className='mr-2 text-gradient-darkBlue bg-white-filterButton text-xs font-light px-5 py-2 rounded-md'
                  onClick={clearAll}
                >
                  Clear All
                </button>
                <button
                  className='ml-2 bg-gradient-darkBlue text-xs font-light text-white px-6 py-2 rounded-md'
                  onClick={() => apply()}
                >
                  Apply
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export const Filter = ({ filterValues, setFilterValues, wholesale = false, pub = false }: FilterProps) => {
  const dispatch = useDispatch();
  const userAddress = useSelector((state: any) => state.wallet.userAddress);
  const [open, setOpen] = useState(false);

  return (
    <div className='flex mt-auto mb-auto'>
      <button
        onClick={() => {
          if (userAddress) {
            setOpen(true);
          } else {
            dispatch({ type: 'SET_MODAL_WALLET_CONNECT', payload: true });
          }
        }}
      >
        <svg width='18' height='20' viewBox='0 0 18 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path
            d='M17 0.5H1C0.447 0.5 0 0.947 0 1.5V4.09C0 4.613 0.213 5.127 0.583 5.497L6 10.914V18.5C6 18.847 6.18 19.168 6.475 19.351C6.635 19.45 6.817 19.5 7 19.5C7.153 19.5 7.306 19.465 7.447 19.395L11.447 17.395C11.786 17.225 12 16.879 12 16.5V10.914L17.417 5.497C17.787 5.127 18 4.613 18 4.09V1.5C18 0.947 17.553 0.5 17 0.5ZM10.293 9.793C10.105 9.98 10 10.234 10 10.5V15.882L8 16.882V10.5C8 10.234 7.895 9.98 7.707 9.793L2 4.09V2.5H16.001L16.003 4.083L10.293 9.793Z'
            fill='white'
          />
        </svg>
      </button>
      {open && !wholesale && (
        <FilterModal open={open} setOpen={setOpen} filterValues={filterValues} setFilterValues={setFilterValues} />
      )}
      {open && wholesale && pub && (
        <FilterWholesaleModal
          pub={true}
          open={open}
          setOpen={setOpen}
          filterValues={filterValues}
          setFilterValues={setFilterValues}
        />
      )}
      {open && wholesale && !pub && (
        <FilterWholesaleModal
          pub={false}
          open={open}
          setOpen={setOpen}
          filterValues={filterValues}
          setFilterValues={setFilterValues}
        />
      )}
    </div>
  );
};
