import logo from '../../images/logo.svg';
import { Link } from 'react-router-dom';

export default function Top(){
	return (
		<>
			<header className="bg-black z-10 absolute w-full">
				<div className='max-w-7xl mx-auto py-8 px-4 sm:mx-6 lg:mx-8 lg:flex lg:justify-between'>
					<Link to="/">
						<img src={logo} alt='Coindeed Logo' />
					</Link>
				</div>
			</header>
		</>
	);
};
