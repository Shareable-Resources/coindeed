import style from '../../../styles/scss/pages/index/about-section.module.scss';

const AboutSection = () => {
	return (
		<div className={`${style.content} container mx-auto`}>
			<div className={`${style.content__left} mr-6 pl-12`}>
				<h1 className="mt-0 mb-6">What is CoinDeed?</h1>

				<p className="mb-6 mt-0">
					CoinDeed is a permissionless decentralized protocol that aims to
					revolutionize the world of cryptocurrency by creating a one-click shop
					for buyers to own crypto assets.
				</p>

				<a href="#">
					<i>Read CoinDeed’s Whitepaper →</i>
				</a>
			</div>

			<div className={`${style.content__right} pr-12`}>
				<div className="rounded-2xl">TBD</div>
				<div className="rounded-2xl">TBD</div>
			</div>
		</div>
	);
};

export default AboutSection;
