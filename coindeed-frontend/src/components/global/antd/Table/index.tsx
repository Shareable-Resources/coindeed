import { Table as TableAntd, TableProps } from 'antd';
import './style.scss';

export default function Table(props: TableProps<any>) {
  return <TableAntd className={`coindeed__antd--table ${props.className || ''}`} {...props} />;
}
