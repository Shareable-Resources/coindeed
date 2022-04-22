import style from './style.module.scss'

interface CardParticipantProps {
  avatar: StaticImageData
  position: string
  description: string[]
}

const CardParticipant: React.FC<CardParticipantProps> = ({
  avatar,
  description,
  position,
}) => {
  console.log(style)
  return (
    <div className={`${style.participantCard} inline-block`}>
      <div className={style.cardHeader}></div>
      <div className={style.cardAvatar}>
        <img src={avatar.src} alt='Avatar' />
      </div>
      <div className={style.cardContent}>
        <div className={style.participantPosition}>{position}</div>
        <ul>
          {description.map((content, i) => (
            <li className={`opacity-70`} key={i}>
              {content}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default CardParticipant
