import { USDFormatter } from '../../utils/Formatters';
import Table from '../global/antd/Table';
import './AccountSummaryAndTable.css';

type AccountSummaryAndTableProps = {
  title: string;
  tableHeaders: any[];
  tableData: any[];
  summaryTitle: string;
  summaryData: number;
  onRowHandler: any;
  loading?: boolean;
};

export default function AccountSummaryAndTable({
  title,
  tableHeaders,
  tableData,
  summaryTitle,
  summaryData,
  onRowHandler,
  loading,
}: AccountSummaryAndTableProps) {
  return (
    <div className={`border-b border-gray-500 mb-8 pb-8 `}>
      <div className='hidden grid-cols-4 gap-66 lg:grid'>
        <h1 className='col-start-2 col-end-4 text-white font-bold p-0 text-left text-sm mb-2-5 lh-17 '>{title}</h1>
      </div>
      <div className='grid gap-0 lg:grid-cols-4 gap-66 '>
        <div className='flex md:mb-0 lg:grid-span-1'>
          <div className='justify-center bg-gradient-to-r from-gradient-lightBlue to-gradient-darkBlue p-0.5 rounded-md w-full '>
            <div className='bg-blue px-1 flex flex-row lg:flex-col justify-center items-center text-white text-md order-4 rounded-md h-full py-2 lg:py-0'>
              <div className='text-lg font-bold text-center lg:lh-22 lg:mb-6 lg:mx-10 mx-5	'>{summaryTitle}</div>
              <div className='text-2xl font-bold text-moneyBlue tracking-tighter lg:lh-29 lg:mt-1 max-w-195px'>
                {'  '} {USDFormatter.format(summaryData)}
              </div>
            </div>
          </div>
        </div>
        <div className='lg:col-start-2 lg:col-end-5'>
          <Table
            className='coindeed_account__antd--table'
            dataSource={tableData}
            columns={tableHeaders}
            onRow={onRowHandler}
            scroll={{ y: 185 }}
            pagination={false}
            tableLayout='fixed'
            loading={loading}
            showSorterTooltip={false}
          />
        </div>
      </div>
    </div>
  );
}
