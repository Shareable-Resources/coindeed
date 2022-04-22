import type { NextPage } from "next";
import Head from "next/head";
import AboutSection from "../components/pages/index/AboutSection";
import FeaturesSection from "../components/pages/index/FeaturesSection";
import TopSection, {
	modelData as ItIndexSection,
} from "../components/pages/index/TopSection";
import HeroSection from "../components/pages/index/HeroSection";
import IndexSection from "../components/pages/index/IndexSection";
import ProductRoadmap from "../components/pages/index/ProductRoadmap";

const Home: NextPage = () => {
	const dataTopSection1: ItIndexSection = {
		keyword: "DEEDS",
		title: "Top Performing Deeds",
		content:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
		listCard: [
			{ tokenA: "Token A", tokenB: "Token B", value: "+8.24%", type: "up" },
			{ tokenA: "Token A", tokenB: "Token B", value: "+8.24%", type: "up" },
			{ tokenA: "Token A", tokenB: "Token B", value: "+8.24%", type: "up" },
			{ tokenA: "Token A", tokenB: "Token B", value: "+8.24%", type: "up" },
			{ tokenA: "Token A", tokenB: "Token B", value: "+8.24%", type: "up" },
		],
	};
	const dataTopSection2: ItIndexSection = {
		keyword: "LENDING",
		title: "Top Lending Pools",
		content:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
		listCard: [
			{ tokenA: "Token", currency: "APY", value: "0.00%", type: "up" },
			{ tokenA: "Token", currency: "APY", value: "0.00%", type: "up" },
			{ tokenA: "Token", currency: "APY", value: "0.00%", type: "up" },
			{ tokenA: "Token", currency: "APY", value: "0.00%", type: "up" },
			{ tokenA: "Token", currency: "APY", value: "0.00%", type: "up" },
		],
	};
	return (
		<div>
			<Head>
				<title>Coin Deed</title>
				<meta name="description" content="Coin Deed" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<main>
				<HeroSection />
				<IndexSection />
				<AboutSection />
				<hr className="container mx-auto" />
				<FeaturesSection />
				<hr className="container mx-auto" />
				<TopSection modelData={dataTopSection1} />
				<hr className="container mx-auto" />
				<TopSection modelData={dataTopSection2} />
				<hr className="container mx-auto" />
				<ProductRoadmap />
			</main>
		</div>
	);
};

export default Home;
