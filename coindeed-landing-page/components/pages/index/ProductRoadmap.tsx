import style from '../../../styles/scss/pages/index/product-roadmap.module.scss';

const ProductRoadmap = () => {
	const dataTimeline = [
		{
			title: 'OCT 2021',
			active: true,
			list: ['CoinDeed Protocol Whitepaper', 'Launch DToken'],
		},
		{
			title: 'NOV 2021',
			active: true,
			list: ['DToken Private Sale', 'CoinDeed Testnet'],
		},
		{
			title: 'DEC 2021',
			list: ['CoinDeed Mainnet'],
		},
		{
			title: 'Q1 2022',
			list: ['CoinDeed Lending', 'CoinDeed AMM Dex'],
		},
		{
			title: 'Q2 2022',
			list: ['CoinDeed V2'],
		},
	];

	return (
		<div className={`py-24 px-12`}>
			<div className={`${style.content} container mx-auto`}>
				<h2 className={`${style.title} my-0`}>Product Roadmap</h2>

				<div className={style.gTimeline}>
					{dataTimeline.map((el, i) => (
						<div className={style.timeline} key={i}>
							<div className={style.gLine}>
								<div className={style.cercle} />
								<div className={style.line} />
							</div>

							<p className="mt-0 mb-5">{el.title}</p>

							<ul>
								{el.list.map((li, i) => (
									<li key={i}>{li}</li>
								))}
							</ul>
						</div>
					))}

					<div
						className={style.bgGradient}
						style={{
							width: `calc(100% * (${
								dataTimeline.filter((t) => t.active).length
							} / ${dataTimeline.length}))`,
						}}
					/>
				</div>
			</div>
		</div>
	);
};

export default ProductRoadmap;
