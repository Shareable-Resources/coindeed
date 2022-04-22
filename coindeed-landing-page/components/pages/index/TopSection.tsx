import style from '../../../styles/scss/pages/index/top-section.module.scss';

export interface modelData {
	keyword: string;
	title: string;
	content: string;
	listCard: listCard[];
	link?: string;
	linkContent?: string;
}

export interface listCard {
	tokenA: string;
	tokenB?: string;
	value: string;
	currency?: string;
	type: 'up' | 'down';
}

const TopSection = ({ modelData }: { modelData: modelData }) => {
	return (
		<div className={`${style.content} container mx-auto py-20 px-12`}>
			<div className={`${style.content__left} mr-9`}>
				<span className="mt-0 mb-4 inline-block">{modelData.keyword}</span>
				<h2 className="mt-0 mb-4">{modelData.title}</h2>
				<p className="my-0">{modelData.content}</p>
			</div>

			<div className={style.content__right}>
				<div className={style.content__right__gCard}>
					{modelData.listCard.map((el, i) => (
						<div
							key={i}
							className={`${style.content__right__card} rounded-2xl`}
						>
							<div className={style.content__right__card__token}>
								{el.tokenA}
							</div>
							{el.tokenB ? (
								<>
									<span className="mx-2">/</span>
									<div className={style.content__right__card__token}>
										{el.tokenB}
									</div>
								</>
							) : null}

							<div className="mr-auto" />

							{el.currency ? (
								<div className={`${style.content__right__card__currency} mr-2`}>
									{el.currency}
								</div>
							) : null}
							<div className={style[`content__right__card__value--${el.type}`]}>
								{el.value}
							</div>
						</div>
					))}
				</div>

				<a href={modelData.link || '#'} className={style.content__right__link}>
					<i>{modelData.linkContent || 'View More'}</i>
				</a>
			</div>
		</div>
	);
};

export default TopSection;
