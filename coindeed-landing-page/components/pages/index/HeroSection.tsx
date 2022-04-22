import style from '../../../styles/scss/pages/index/hero-section.module.scss';
import imageHeroSection from '../../../assets/images/HeroSection.png';
import SVGCerclePlay from '../../../assets/icons/js/cercle-play';
import Discord from '../../../assets/icons/Discord.png';
import Twitter from '../../../assets/icons/Twitter.png';
import Reddit from '../../../assets/icons/Reddit.png';
import SVGPlay from '../../../assets/icons/js/play';
import { useState } from 'react';

const HeroSection = () => {
	const [isOpenModelVideo, setIsOpenModelVideo] = useState(false);
	function toggleModelVideo() {
		setIsOpenModelVideo(!isOpenModelVideo);
	}
	function stopPropagation(e: any) {
		e.stopPropagation();
	}

	return (
		<div className={style.HeroSection}>
			<div className={`${style.content} container mx-auto`}>
				<div className={`${style.content__text} mr-4`}>
					<h1 className="mt-0">
						Crypto Equity <br /> Starts with a <span>Deed</span>
					</h1>

					<p className="mb-9 mt-0">
						One-stop shop for trading cryptocurrency at the best price.
					</p>

					<div className={`${style.content__action}`}>
						<a
							href="#"
							className={`leading-4 rounded-full px-4 py-2 bg-primary`}
							style={{ color: 'white' }}
						>
							Enter App
						</a>

						<p
							className={`leading-4 rounded-full px-4 py-2 my-0`}
							onClick={toggleModelVideo}
						>
							<SVGCerclePlay />
							<span>Watch Video</span>
						</p>
					</div>
				</div>

				<div className={`${style.content__image}`}>
					<img
						src={imageHeroSection.src}
						draggable="false"
						loading="lazy"
						alt=""
					/>
				</div>
			</div>

			<div className={`${style.social} rounded-full`}>
				<a href="#">
					<img src={Discord.src} draggable="false" loading="lazy" alt="" />
				</a>
				<a href="#">
					<img src={Twitter.src} draggable="false" loading="lazy" alt="" />
				</a>
				<a href="#">
					<img src={Reddit.src} draggable="false" loading="lazy" alt="" />
				</a>
			</div>

			{isOpenModelVideo ? (
				<div className={`${style.modelVideo}`} onClick={toggleModelVideo}>
					<div onClick={stopPropagation} className="flex">
						<SVGPlay className="m-auto" style={{ cursor: 'pointer' }} />
					</div>
				</div>
			) : null}
		</div>
	);
};

export default HeroSection;
