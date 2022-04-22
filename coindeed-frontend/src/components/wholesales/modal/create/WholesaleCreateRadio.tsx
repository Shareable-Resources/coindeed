import { Dispatch, SetStateAction, useState } from 'react';
import { RadioGroup } from '@headlessui/react';

type WholesaleCreateRadioProps = {
  priv: boolean;
  setPriv: Dispatch<SetStateAction<boolean>>;
};

const settings = [
  {
    name: 'Public',
  },
  {
    name: 'Private',
  },
];

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export function WholesaleCreateRadio({ priv, setPriv }: WholesaleCreateRadioProps) {
  const [selected, setSelected] = useState(settings[0]);

  return (
    <div className='mr-auto'>
      <RadioGroup value={selected} onChange={setSelected}>
        <RadioGroup.Label className='sr-only'>Privacy setting</RadioGroup.Label>
        <div className='text-white rounded-md -space-y-px mr-4'>
          {settings.map((setting, settingIdx) => (
            <div
              className=''
              onClick={() => (setting.name === settings[1].name ? setPriv(true) : setPriv(false))}
              key={setting.name}
            >
              <RadioGroup.Option
                value={setting}
                className={({ checked }) =>
                  classNames(
                    settingIdx === 0 ? 'rounded-tl-md rounded-tr-md' : '',
                    settingIdx === settings.length - 1 ? 'rounded-bl-md rounded-br-md' : '',
                    checked ? 'bg-red' : 'border-gray-200',
                    'relative flex cursor-pointer py-2 text-white',
                  )
                }
              >
                {({ active, checked }) => (
                  <>
                    <span
                      className={classNames(
                        checked ? 'bg-indigo-600 border-transparent' : 'bg-white border-gray-300',
                        active ? 'ring-2 ring-offset-2 ring-indigo-500' : '',
                        'h-4 w-4 mt-0.5 cursor-pointer rounded-full border flex items-center justify-center',
                      )}
                      aria-hidden='true'
                    >
                      <span className='rounded-full bg-white w-1.5 h-1.5' />
                    </span>
                    <div className='ml-3 flex flex-col'>
                      <RadioGroup.Label
                        as='span'
                        className={classNames(checked ? 'text-blue-500' : 'text-white', 'block text-sm font-medium')}
                      >
                        {setting.name}
                      </RadioGroup.Label>
                    </div>
                  </>
                )}
              </RadioGroup.Option>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
}
