import React from 'react';

interface HomepageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HomepageModal: React.FC<HomepageModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 my-8">
        <div className="bg-indigo-600 p-8 text-white flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <span className="text-5xl">🏠</span>
            <h2 className="text-3xl font-bold">Aseta aloitussivuksi</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full text-3xl font-bold transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="p-10 space-y-10 max-h-[70vh] overflow-y-auto text-slate-700">
          <section className="space-y-4">
            <h3 className="text-2xl font-black text-slate-800">Mikä on aloitussivu?</h3>
            <p className="text-xl leading-relaxed">
              Aloitussivu eli "kotisivu" on verkkosivu, joka aukeaa automaattisesti, kun avaat internet-selaimen (esim. Chrome, Edge tai Firefox). Voit itse valita, mikä sivu avautuu ensimmäisenä.
            </p>
          </section>

          <section className="space-y-6">
            <h3 className="text-2xl font-black text-slate-800 underline decoration-indigo-200 underline-offset-8">Näin otat Seniorin aloitussivun aloitussivuksi</h3>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
              <p className="text-lg font-medium">1. Avaa selaimesi (Google Chrome, Microsoft Edge tai Mozilla Firefox).</p>
              <p className="text-lg font-medium">2. Kirjoita osoiteriville:</p>
              <div className="bg-white p-4 rounded-xl border-2 border-indigo-100 text-indigo-700 font-mono text-center text-lg select-all cursor-pointer hover:bg-indigo-50 transition-colors">
                https://eerotuomenoksa.github.io/seniorin-aloitussivu/
              </div>
              <p className="text-lg font-medium">3. Seuraa ohjeita oman selaimesi mukaan:</p>
            </div>

            <div className="space-y-8 mt-6">
              {/* Google Chrome */}
              <div className="space-y-3">
                <h4 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                  <span className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center text-sm">C</span> Google Chrome:
                </h4>
                <ul className="list-disc ml-6 space-y-2 text-lg">
                  <li>Klikkaa oikeassa yläkulmassa olevaa kolmea pistettä ("Lisää").</li>
                  <li>Valitse <strong>Asetukset</strong>.</li>
                  <li>Valitse vasemmalta <strong>Käynnistettäessä</strong> tai "On startup".</li>
                  <li>Valitse <strong>Avaa tietty sivu tai sivut</strong>.</li>
                  <li>Paina <strong>Lisää uusi sivu</strong> ja liitä osoite ylhäältä.</li>
                  <li>Tallenna.</li>
                </ul>
              </div>

              {/* Microsoft Edge */}
              <div className="space-y-3">
                <h4 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                  <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm">E</span> Microsoft Edge:
                </h4>
                <ul className="list-disc ml-6 space-y-2 text-lg">
                  <li>Klikkaa oikeassa yläkulmassa olevaa kolmea pistettä.</li>
                  <li>Valitse <strong>Asetukset</strong>.</li>
                  <li>Valitse <strong>Käynnistettäessä</strong>.</li>
                  <li>Valitse <strong>Avaa tietty sivu tai sivut</strong>.</li>
                  <li>Klikkaa <strong>Lisää uusi sivu</strong> ja liitä osoite ylhäältä.</li>
                  <li>Tallenna.</li>
                </ul>
              </div>

              {/* Mozilla Firefox */}
              <div className="space-y-3">
                <h4 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                  <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center text-sm">F</span> Mozilla Firefox:
                </h4>
                <ul className="list-disc ml-6 space-y-2 text-lg">
                  <li>Klikkaa oikeassa yläkulmassa olevia kolmea viivaa.</li>
                  <li>Valitse <strong>Asetukset</strong>.</li>
                  <li>Etsi kohta <strong>Käynnistys</strong> tai <strong>Aloitussivu</strong>.</li>
                  <li>Kirjoita tai liitä osoitteeksi yllä oleva linkki.</li>
                  <li>Tallenna.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-amber-50 p-8 rounded-3xl border-2 border-amber-100 space-y-4">
            <h3 className="text-xl font-bold text-amber-800 flex items-center gap-2">
              <span>💡</span> Vinkki
            </h3>
            <p className="text-lg text-amber-900 leading-relaxed">
              Jos et löydä oikeaa asetusta, voit pyytää apua esimerkiksi läheiseltä, digiopastajalta tai kirjastosta. Monet digituen palvelut auttavat tässä asiassa!
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-2xl font-black text-slate-800">Miksi kannattaa käyttää aloitussivua?</h3>
            <ul className="space-y-3">
              <li className="flex gap-4 items-center text-lg">
                <span className="text-green-500 font-bold">✓</span>
                Pääset tärkeimmille sivuille helposti
              </li>
              <li className="flex gap-4 items-center text-lg">
                <span className="text-green-500 font-bold">✓</span>
                Sivun käyttö on turvallista ja selkeää
              </li>
              <li className="flex gap-4 items-center text-lg">
                <span className="text-green-500 font-bold">✓</span>
                Säästät aikaa, kun kaikki löytyy yhdestä paikasta
              </li>
            </ul>
          </section>

          <div className="bg-green-50 p-8 rounded-3xl text-center border-2 border-green-100">
            <p className="text-2xl font-black text-green-700">Onnittelut! 🎉</p>
            <p className="text-lg text-green-800 mt-2">Nyt Seniorin aloitussivu aukeaa automaattisesti, kun avaat selaimen.</p>
          </div>
        </div>
        
        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center sticky bottom-0 z-10">
          <button 
            onClick={onClose}
            className="text-xl font-bold text-slate-500 hover:text-slate-800"
          >
            Sulje ohjeet
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomepageModal;