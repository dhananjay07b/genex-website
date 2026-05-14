import { motion } from 'framer-motion'

export function LoadingScreen() {
  const dots = [0, 1, 2]

  return (
    <motion.div
      className="fixed inset-0 z-9999 flex flex-col items-center justify-center"
      style={{ backgroundColor: '#0A1628' }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.45, ease: 'easeInOut' } }}
    >
      {/* Logo container */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, scale: 0.82 }}
        animate={{
          opacity: 1,
          scale: [0.82, 1, 1.03, 1],
          transition: {
            opacity: { duration: 0.55, ease: 'easeOut' },
            scale: {
              times: [0, 0.35, 0.65, 1],
              duration: 1.4,
              ease: 'easeOut',
            },
          },
        }}
      >
        {/* Shimmer sweep overlay */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-sm">
          <div className="shimmer-sweep absolute inset-y-0 w-1/3 bg-linear-to-r from-transparent via-white/20 to-transparent" />
        </div>

        {/* Inline favicon SVG */}
        <motion.svg
          width="140"
          height="75"
          viewBox="0 0 523 281"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          animate={{
            scale: [1, 1.025, 1],
            transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 1.6 },
          }}
        >
          <path
            d="M134.498 0.120034C179.956 -1.74563 227.133 18.1987 248.858 60.2128C244.557 64.0324 237.19 69.245 232.35 72.8769L200.999 96.3525C196.144 88.231 192.984 83.173 185.995 76.5224C171.949 63.4102 153.285 56.39 134.08 56.995C116.516 57.3873 99.8906 65.0001 88.1189 78.04C70.5033 97.1724 64.5917 121.555 65.6218 147.058C67.3181 189.069 97.5497 226.428 142.009 223.721C168.34 222.115 187.758 208.728 204.951 189.423L205.009 180.858L152.334 180.972C151.55 167.534 152.144 148.065 152.134 134.282C164.959 134.603 178.47 134.402 191.344 134.408L258.445 134.308L258.428 278.942C241.798 278.287 221.683 278.54 204.973 278.88C204.693 270.436 204.914 260.764 204.908 252.226C187.579 267.992 168.701 277.639 145.149 280.139C111.053 283.633 76.9775 273.325 50.5319 251.526C20.9056 227.297 4.72597 192.879 0.825893 155.219C-7.33401 76.421 45.7587 8.29224 125.226 0.503823C128.016 0.119094 131.608 0.239042 134.498 0.120034ZM276 191.212C300.904 190.758 327.569 191.174 352.592 191.168L352.599 276.054C327.084 275.94 301.565 275.998 276.047 276.212L276 191.212ZM276.809 0.180581C295.697 0.186248 317.286 -0.359668 335.944 0.419839C339.872 4.49633 345.485 12.0548 349.099 16.6464L372.365 46.1952L446.327 140.06C445.25 128.7 445.924 104.731 445.924 92.2821L445.847 0.221597L522.397 0.197183L522.39 136.245L522.372 276.139L462.024 276.189C457.365 271.442 451.874 264.25 447.58 258.917L424.81 230.664C396.922 196.095 368.248 159.391 339.747 125.63L296.935 75.1054C290.084 67.0216 275.322 52.9732 276.355 43.4521C277.22 35.4787 274.827 5.606 276.809 0.180581Z"
            fill="url(#loading-gradient)"
          />
          <defs>
            <linearGradient
              id="loading-gradient"
              x1="-5.80333"
              y1="149.85"
              x2="513.5"
              y2="150"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#1AAEE8" />
              <stop offset="0.5" stopColor="#00C5B0" />
              <stop offset="1" stopColor="#00D97E" />
            </linearGradient>
          </defs>
        </motion.svg>
      </motion.div>

      {/* Loading dots */}
      <motion.div
        className="mt-10 flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.8, duration: 0.4 } }}
      >
        {dots.map((i) => (
          <motion.span
            key={i}
            className="block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: '#00C5B0' }}
            animate={{
              y: [0, -6, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: i * 0.18,
              ease: 'easeInOut',
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  )
}
