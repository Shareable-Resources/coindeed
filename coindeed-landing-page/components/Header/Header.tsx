import style from './style.module.scss';
import logo from '../../assets/images/Logo.png';
import SVGClose from '../../assets/icons/js/close';
import SVGArrowLeft from '../../assets/icons/js/arrow-left';
import { useState } from 'react';

interface ItNavMenu {
	label: string;
	link?: string;
	children?: ItNavMenu[];
}

const ItemMenu = ({ dataMenu }: { dataMenu: ItNavMenu[] }) => {
	return (
		<>
			<ul>
				{dataMenu.map((el, i) => (
					<li key={i} tabIndex={0}>
						<a href={el.link} rel="noreferrer" className="font-size-2">
							{el.label}
							{el.children?.length ? <SVGArrowLeft className="ml-2" /> : null}
						</a>
						{el.children?.length && <ItemMenu dataMenu={el.children} />}
					</li>
				))}
			</ul>
		</>
	);
};

const Header = () => {
	const dataMenu: ItNavMenu[] = [
		{
			label: 'Developers',
			children: [{ label: 'GitHub' }, { label: 'Bug Bounty' }],
		},
		{
			label: 'Documentation',
			children: [
				{ label: 'Overview' },
				{ label: 'CoinDeed Docs' },
				{ label: 'DTokenomics' },
				{ label: 'FAQs' },
			],
		},
		{
			label: 'Community',
			children: [
				{ label: 'Discord' },
				{ label: 'Twitter' },
				{ label: 'Reddit' },
				{ label: 'Forum' },
				{ label: 'Media' },
			],
		},
	];
	const [activeMenu, setActiveMenu] = useState(false);

	function toggleMenu() {
		setActiveMenu(!activeMenu);
	}

	return (
		<header className={`${style.header} container py-4 mx-auto`}>
			<img src={logo.src} draggable="false" alt="" onClick={toggleMenu} />

			<div className={`${style.menu} ${activeMenu ? style.menuActive : null}`}>
				<div className="flex">
					<SVGClose onClick={toggleMenu} />
				</div>

				<ItemMenu dataMenu={dataMenu} />
			</div>

			<a href="#" className="py-2 px-3.5 rounded-full leading-4">
				Enter App
			</a>
		</header>
	);
};

export default Header;
