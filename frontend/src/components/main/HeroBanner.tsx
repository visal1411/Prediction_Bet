export default function HeroBanner() {
  return (
    <div className="relative w-full h-96 rounded-xl overflow-hidden mb-8 shadow-2xl">
      {/* Background Image / Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary-bg)] via-[rgba(26,30,41,0.8)] to-transparent z-10" />
      <div
        className="absolute inset-0 bg-cover bg-center z-0 opacity-40"
        style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBm69U3Yqu5LCd2FYJHV7FFCcZ0KAONVrY5PIPi_uoY6stPw_qlO-KM69AzbIYmbnY4UvyNVKDznXF-HezLZkBAl19x8TSUA-hhpsARSL6ZHQN1w5xxwPfeTLjKElFtH-VH2cz7mozUltgcUx_vhS1-DbUyjQs46Phj-3ZB_TVNCGLkMxdWn5LYM3kUZwtsMu3BHQmdqxM039ePXI-L_wLbPhCSz4pBpw9qvG6Q7zhsmI9HKXycRarvte1vua_HLBpeza86wX67t-o")' }}
      />

      <div className="relative z-20 h-full p-8 flex flex-col justify-center max-w-4xl">
        <div className="flex items-center space-x-2 mb-4">
          <span className="bg-red-500 w-2 h-2 rounded-full animate-pulse" />
          <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-sm tracking-wider">UEFA CHAMPIONS LEAGUE</span>
          <span className="text-[var(--color-text-muted)] text-xs font-medium pl-2">20 JULY 2026 • 20:00</span>
        </div>

        <div className="flex items-center space-x-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-xl flex items-center justify-center p-2 shadow-lg">
              {/* Team 1 Logo placeholder */}
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center border-2 border-yellow-400">
                <span className="text-white text-xs font-bold">MU</span>
              </div>
            </div>
            <h1 className="text-4xl font-extrabold text-white leading-tight">MAN<br />UTD</h1>
          </div>

          <div className="text-xl font-bold text-[var(--color-text-muted)] italic px-2">VS</div>

          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-xl flex items-center justify-center p-2 shadow-lg">
              {/* Team 2 Logo placeholder */}
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-gray-300">
                <span className="text-blue-900 text-xs font-bold">RM</span>
              </div>
            </div>
            <h1 className="text-4xl font-extrabold text-white leading-tight">REAL<br />MADRID</h1>
          </div>
        </div>

        <p className="text-[var(--color-text-muted)] text-sm mb-8 leading-relaxed max-w-md">
          The ultimate clash in the Quarter Finals. Two titans of European football meet at Old Trafford for a spot in the semi-finals.
        </p>

        <div className="flex space-x-4">
          <button className="bg-white hover:bg-gray-200 text-[var(--color-primary-bg)] font-bold px-6 py-3 rounded-md transition-colors shadow-lg">
            PLACE BET
          </button>
          <button className="bg-transparent border border-gray-400 hover:border-white text-white font-medium px-6 py-3 rounded-md transition-colors">
            VIEW MATCH
          </button>
        </div>
      </div>
    </div>
  );
}
