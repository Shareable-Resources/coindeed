import style from './style.module.scss'
import CustomCarousel from './component/custom-carousel'
import CardParticipant from './component/card-paticipant'
import Image from 'next/image'

// Icon import
import BuyerAvatar from '../../assets/images/buyer-avatar.png'
import DeedManagerAvatar from '../../assets/images/deed-manager-avatar.png'
import DeedBrokerAvatar from '../../assets/images/deed-broker-avatar.png'
import LenderAvatar from '../../assets/images/lender-avatar.png'
import WholesalerAvatar from '../../assets/images/wholesaler-avatar.png'
import Discord from '../../assets/images/discord.png'
import Twitter from '../../assets/images/twitter.png'
import Reddit from '../../assets/images/reddit.png'
import PurpleCube from '../../assets/images/purple-cube.png'
import NormalCube from '../../assets/images/normal-cube.png'
import SeperateLine from '../../assets/images/seperate-line.png'
import Step1RepresentImage from '../../assets/images/step-1.png'
import Step2RepresentImage from '../../assets/images/step-2.png'
import Step3RepresentImage from '../../assets/images/step-3.png'
import Step4RepresentImage from '../../assets/images/step-4.png'
import Step5RepresentImage from '../../assets/images/step-5.png'

interface IDataParticipate {
  avatar: StaticImageData
  position: string
  description: string[]
}

interface IDataStep {
  stepNumber: number
  description: string
  representImage: StaticImageData
}

const overview = () => {
  const dataParticipate: IDataParticipate[] = [
    {
      avatar: BuyerAvatar,
      position: 'Buyer',
      description: [
        'Participate in Deed with downpayment',
        'Flexible ways to exit the deed and own tokens',
      ],
    },
    {
      avatar: DeedManagerAvatar,
      position: 'Deed Manager',
      description: ['Create and manage Deeds', 'Profit from management fees'],
    },
    {
      avatar: DeedBrokerAvatar,
      position: 'Deed Broker',
      description: [
        'Facilitate Manager to sell Deed',
        'Profit from management fees',
      ],
    },
    {
      avatar: LenderAvatar,
      position: 'Lender',
      description: ['Supply loan to Deeds', 'Profit from interest acquired'],
    },
    {
      avatar: WholesalerAvatar,
      position: 'Wholesaler',
      description: [
        'Swap tokens for each deed at a fixed or market price',
        'Profit from batch trading',
      ],
    },
  ]

  const dataStep: IDataStep[] = [
    {
      stepNumber: 1,
      description: 'Deed created as a smart contract on Ethereum',
      representImage: Step1RepresentImage,
    },
    {
      stepNumber: 2,
      description: 'Deed gets loan and buy coins',
      representImage: Step2RepresentImage,
    },
    {
      stepNumber: 3,
      description: 'Deed re-lends to earn interest',
      representImage: Step3RepresentImage,
    },
    {
      stepNumber: 4,
      description: 'Deed automatically mitigates the risk of liquidation',
      representImage: Step4RepresentImage,
    },
    {
      stepNumber: 5,
      description: 'Deed transfer coin ownership to owner',
      representImage: Step5RepresentImage,
    },
  ]

  return (
    <div className={style.overviewContainer}>
      <div className={`${style.overviewHeader} flex`}>
        <span className={`${style.title} font-size-5 opacity-70`}>
          OVERVIEW ________
        </span>
      </div>
      <div className={style.participate}>
        <div className={style.participateHeaderContainer}>
          <div className={style.participateHeader}>Participate to Earn</div>
          <div className={`${style.participateSubHeader} mt-2`}>
            <div>
              Within the CoinDeed ecosystem, there’s a role for everyone to play
              in.
            </div>
            <div>Here are some ways that you can participate to earn.</div>
          </div>
        </div>
        <div>
          <CustomCarousel>
            {dataParticipate.map((user, index) => {
              return (
                <CardParticipant
                  key={index}
                  avatar={user.avatar}
                  position={user.position}
                  description={user.description}
                />
              )
            })}
          </CustomCarousel>
        </div>
        <div className={style.socialLinks}>
          <img src={Discord.src} alt='Discord' />
          <img src={Twitter.src} alt='Twitter' />
          <img src={Reddit.src} alt='Reddit' />
        </div>
      </div>

      <div className={style.howItWork}>
        <div className={style.howItWorkHeader}>
          How CoinDeed Works in 5 Easy Steps
        </div>
        <div>
          {dataStep.map((step, index) => {
            return (
              <div className={style.stepDetail}>
                <div className={style.stepIcon}>
                  <img className={style.cube} src={NormalCube.src} alt='Cube' />
                  <img
                    className={style.seperateLine}
                    src={SeperateLine.src}
                    alt='Seperate line'
                  />
                </div>
                {/* <div className={style.stepInformation}>
                  <button>
                    <div>Step {step.stepNumber}</div>
                    <div>{step.description}</div>
                  </button>
                </div>
                <div className={style.stepRepresentImage}>
                  <img
                    src={step.representImage.src}
                    alt='Step Represent Image'
                  />
                </div> */}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default overview
