import { Deed } from '../components/deed/dashboard/DeedTable';
import axios from 'axios';

const url = 'http://localhost:4000/deeds';
/*
  REQUEST Filters ON deeds
  allOrMy(Filter)     ['All', 'My'] // DEFAULTS TO ALL
  
  action(Filter)     ['Joined', 'Created','Staked'] // NO DEFAULT
  deedType(Filter)      ['Fixed', 'Floating] // no default
  status(Filter)     ['Recruiting', 'Escrow', 'Open', 'Completed', 'Canceled']
  leverage(Filter)   [1,6,11,20] 

  searchEntry           - 
  searchFilter 
    status                - ['Recruiting', 'Escrow', 'Open', 'Completed', 'Canceled']
    deedAddress         - deed Address
    deedManager         - deed Manager
    all                 - searches many things

  sortName        [status,token,wholesaleAddress,wholesaleManager,deedAddress,size,endDate,timeLeft,] // NO DEFAULT
  sortDirection   ['asc','desc'] // NO DEFAULT WILL NOT RUN UNLESS sortName and sortDirection are entered correctly
  
  **Pagination**
  take  - # of records per page           
  skip  - where we start

*/
export class getDeedsInput {
  allOrMyStr: 'All' | 'My';
  actionStr: string | undefined;
  deedTypeStr: string | undefined;
  statusStr: string | undefined;
  leverageStr: string | undefined;
  searchEntryStr: string | undefined;
  searchFilterStr: string | undefined;
  sortNameStr: string | undefined;
  sortDirectionStr: 'asc' | 'desc' | undefined = undefined;
  takeNum: number | undefined = undefined;
  skipNum: number | undefined = undefined;

  constructor(
    allOrMyStr: 'All' | 'My' = 'All',
    actionStr: string | undefined = undefined,
    deedTypeStr: string | undefined = undefined,
    statusStr: string | undefined = undefined,
    leverageStr: string | undefined = undefined,
    searchEntryStr: string | undefined = undefined,
    searchFilterStr: string | undefined = undefined,
    sortNameStr: string | undefined = undefined,
    sortDirectionStr: 'asc' | 'desc' | undefined = undefined,
    takeNum: number | undefined = undefined,
    skipNum: number | undefined = undefined,
  ) {
    this.allOrMyStr = allOrMyStr;
    this.actionStr = actionStr;
    this.deedTypeStr = deedTypeStr;
    this.statusStr = statusStr;
    this.leverageStr = leverageStr;
    this.searchEntryStr = searchEntryStr;
    this.searchFilterStr = searchFilterStr;
    this.sortNameStr = sortNameStr;
    this.sortDirectionStr = sortDirectionStr;
    this.takeNum = takeNum;
    this.skipNum = skipNum;
  }
}

export const getDeeds = async ({
  allOrMyStr,
  actionStr,
  deedTypeStr,
  statusStr,
  leverageStr,
  searchEntryStr,
  searchFilterStr,
  sortNameStr,
  sortDirectionStr,
  takeNum,
  skipNum,
}: getDeedsInput): Promise<Deed[]> => {
  const allOrMy = allOrMyStr ? `allOrMy={${allOrMyStr}}&` : '';
  const status = statusStr ? `status={${statusStr}}&` : '';
  const deedType = deedTypeStr ? `deedType={${deedTypeStr}}&` : '';
  const action = actionStr ? `action={${actionStr}}&` : '';
  const leverage = leverageStr ? `leverage={${leverageStr}}&` : '';
  const searchEntry = searchEntryStr ? `searchEntry={${searchEntryStr}}&` : '';
  const searchFilter = searchFilterStr ? `searchFilter={${searchFilterStr}}&` : '';
  const sortName = sortNameStr ? `sortName={${sortNameStr}}&` : '';
  const sortDirection = sortDirectionStr ? `sortDirection={${sortDirectionStr}}&` : '';
  const take = takeNum ? `take={${takeNum}}&` : '';
  const skip = skipNum ? `skip={${skipNum}}&` : '';

  const completeUrl = [
    url,
    '?',
    allOrMy,
    status,
    deedType,
    action,
    leverage,
    searchEntry,
    searchFilter,
    sortName,
    sortDirection,
    take,
    skip,
  ].join('');
  return axios
    .get(completeUrl)
    .then(res => {
      return res.data;
    })
    .catch(err => {
      console.error(err);
    });
};

export const getDeed = async (id: string) => {
  return axios
    .get(url + `/${id}`)
    .then(res => {
      return res.data;
    })
    .catch(err => {
      console.log(err);
    });
};
