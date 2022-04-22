import style from '../../../styles/scss/pages/index/features-section.module.scss';

const FeaturesSection = (props: any) => {
	const listCard = [
		{
			logo: require('../../../assets/images/6143ad4af0e9ecd5e521bdd6_income 1.png')
				?.default,
			title: 'Buy Coins and Pay Later',
			content:
				'New fashion trading service providing loans, trading, and risk control all in one deed.',
			link: '#',
		},
		{
			logo: require('../../../assets/images/6143ad4af0e9ecd5e521bdd6_income 2.png')
				?.default,
			title: 'Unlimited Profit with Controlled Risk',
			content:
				'Deed’s auto two laywers risk mitigation process enables and will never get liquidated.',
			linkContent: 'View Docs',
		},
		{
			logo: require('../../../assets/images/6143ad4af0e9ecd5e521bdd6_income 3.png')
				?.default,
			title: 'Participate to Earn',
			content:
				'Everyone has a role in CoinDeed’s ecosystem with opportunities to earn rewards.',
			linkContent: 'Explore Roles',
		},
		{
			logo: require('../../../assets/images/6143ad4af0e9ecd5e521bdd6_income 4.png')
				?.default,
			title: 'No Over-Collateral, No Liquidation and No Slippage',
			content:
				'Best trading expiration from no over-collateral loan, no liquidation for leverage and no slippage for wholesale trading.',
		},
	];
	return (
		<div className="relative py-20 px-12">
			<div className={`${style.content} container mx-auto`}>
				<h1 className={style.title}>
					The most <span>powerful</span> and <span>secured</span> DeFi protocol
				</h1>
				<p className={style.subTitle}>Benefits of using CoinDeed’s ecosystem</p>

				<div className={style.gCard}>
					{listCard.map((el, i) => (
						<div key={i} className={`${style.card} rounded-2xl`} {...props}>
							<img src={el.logo.src} draggable="false" loading="lazy" alt="" />

							<h3>{el.title}</h3>

							<p>{el.content}</p>

							<a href={el.link || '#'}>{el.linkContent || 'Learn More'}</a>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

FeaturesSection.prototype = {
	style,
};

export default FeaturesSection;
