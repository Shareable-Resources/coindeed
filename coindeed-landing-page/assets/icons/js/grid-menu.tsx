function SVGGridMenu(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="512"
      height="512"
      fill="currentColor"
      {...props}
    >
      <path d="M4.5,19.5V22H3a1,1,0,0,1-1-1V19.5H4.5m2-2H0V21a3,3,0,0,0,3,3H6.5V17.5Z" />
      <path d="M22,19.5V21a1,1,0,0,1-1,1H19.5V19.5H22m2-2H17.5V24H21a3,3,0,0,0,3-3V17.5Z" />
      <path d="M4.5,10.75v2.5H2v-2.5H4.5m2-2H0v6.5H6.5V8.75Z" />
      <path d="M22,10.75v2.5H19.5v-2.5H22m2-2H17.5v6.5H24V8.75Z" />
      <path d="M4.5,2V4.5H2V3A1,1,0,0,1,3,2H4.5m2-2H3A3,3,0,0,0,0,3V6.5H6.5V0Z" />
      <path d="M13.25,19.5V22h-2.5V19.5h2.5m2-2H8.75V24h6.5V17.5Z" />
      <path d="M13.25,10.75v2.5h-2.5v-2.5h2.5m2-2H8.75v6.5h6.5V8.75Z" />
      <path d="M13.25,2V4.5h-2.5V2h2.5m2-2H8.75V6.5h6.5V0Z" />
      <path d="M21,2a1,1,0,0,1,1,1V4.5H19.5V2H21m0-2H17.5V6.5H24V3a3,3,0,0,0-3-3Z" />
    </svg>
  );
}

export default SVGGridMenu
