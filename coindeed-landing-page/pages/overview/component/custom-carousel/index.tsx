import { Carousel } from 'antd'
import style from './style.module.scss'
import Image from 'next/image'

interface CustomCarouselProps {
  children: any
}

const NextArrow = ({ onClick }: { onClick: any }) => {
  if (!onClick)
    return (
      <div className={style.iconWrapperNext}>
        <Image
          src='/right-arrow-disabled.svg'
          alt='Next Arrow'
          width={50}
          height={50}
        />
      </div>
    )
  return (
    <div
      className={`${style.iconWrapperNext} cursor-pointer`}
      onClick={onClick}
    >
      <Image
        src='/right-arrow-icon.svg'
        alt='Next Arrow'
        width={50}
        height={50}
      />
    </div>
  )
}

const PrevArrow = ({ onClick }: { onClick: any }) => {
  if (!onClick)
    return (
      <div className={style.iconWrapperPrev}>
        <Image
          src='/left-arrow-disabled.svg'
          alt='Prev Arrow'
          width={50}
          height={50}
        />
      </div>
    )
  return (
    <div
      className={`${style.iconWrapperPrev} cursor-pointer`}
      onClick={onClick}
    >
      <Image
        src='/left-arrow-icon.svg'
        alt='Prev Arrow'
        width={50}
        height={50}
      />
    </div>
  )
}

const CustomCarousel: React.FC<CustomCarouselProps> = ({ children }) => {
  return (
    <Carousel
      arrows={true}
      // lazyLoad={true}
      nextArrow={<NextArrow onClick />}
      prevArrow={<PrevArrow onClick />}
      dots={false}
      slidesToShow={3}
      slidesToScroll={1}
      infinite={false}
      adaptiveHeight={true}
      className={style.customCarousel}
    >
      {children}
    </Carousel>
  )
}

export default CustomCarousel
