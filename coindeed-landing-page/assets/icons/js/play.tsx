function SVGPlay(props: any) {
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M40 72.5L70 50L40 27.5V72.5ZM50 0C22.4 0 0 22.4 0 50C0 77.6 22.4 100 50 100C77.6 100 100 77.6 100 50C100 22.4 77.6 0 50 0ZM50 90C27.95 90 10 72.05 10 50C10 27.95 27.95 10 50 10C72.05 10 90 27.95 90 50C90 72.05 72.05 90 50 90Z"
      />
    </svg>
  );
}

export default SVGPlay;
