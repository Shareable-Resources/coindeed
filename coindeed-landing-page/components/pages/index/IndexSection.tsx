import style from '../../../styles/scss/pages/index/index-section.module.scss';

const IndexSection = () => {
	const data = [
		{ value: '$00.0M', label: 'Total Volume Locked' },
		{ value: '00.0%', label: 'Total Deed APY' },
		{ value: '$00.0M', label: 'Total Deed Volume' },
		{ value: '$00.0M', label: 'Total Lending Liquidity' },
	];
	return (
		<div className="bg-primary--50 flex">
			<div className={`${style.indexSection} container`}>
				{data.map((el, i) => (
					<div key={i} className="rounded-2xl">
						<h4 className="mt-0">{el.value}</h4>
						<p>{el.label}</p>
					</div>
				))}
			</div>
		</div>
	);
};

export default IndexSection;
