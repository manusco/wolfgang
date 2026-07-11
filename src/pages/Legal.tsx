import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LanguageToggle } from '../components/ui/LanguageToggle';
import { useLanguageStore } from '../store/languageStore';
import { translations } from '../i18n/translations';

export function Legal() {
    const navigate = useNavigate();
    const { language } = useLanguageStore();
    const t = translations[language].legal;
    const isDe = language === 'de';

    return (
        <div className="max-w-2xl mx-auto w-full animate-in fade-in duration-500">
            <LanguageToggle />

            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="px-0">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-2xl font-bold">{t.footerLink}</h1>
            </div>

            {/* Impressum */}
            <Card className="space-y-4 mb-6">
                <h2 className="text-xl font-bold">{t.imprintTitle}</h2>
                <div className="text-gray-300 text-sm leading-relaxed space-y-3">
                    {isDe ? (
                        <>
                            <p>Angaben gemäß § 5 DDG</p>
                            <p>
                                Pirate GmbH<br />
                                Brabanter Str. 53<br />
                                50672 Köln<br />
                                Deutschland
                            </p>
                            <p>Vertreten durch den Geschäftsführer: Manuel Kölman</p>
                            <p>
                                Handelsregister: HRB 106820<br />
                                Registergericht: Amtsgericht Köln<br />
                                Umsatzsteuer-ID: DE277322989
                            </p>
                            <p>
                                Kontakt:<br />
                                E-Mail: info@pirate.global
                            </p>
                            <p>
                                Verantwortlich i.S.d. § 18 Abs. 2 MStV: Manuel Kölman, Brabanter Str. 53,
                                50672 Köln
                            </p>
                        </>
                    ) : (
                        <>
                            <p>Information pursuant to § 5 DDG (German Digital Services Act)</p>
                            <p>
                                Pirate GmbH<br />
                                Brabanter Str. 53<br />
                                50672 Cologne<br />
                                Germany
                            </p>
                            <p>Represented by the Managing Director: Manuel Kölman</p>
                            <p>
                                Commercial register: HRB 106820<br />
                                Register court: Amtsgericht Köln (Cologne Local Court)<br />
                                VAT ID: DE277322989
                            </p>
                            <p>
                                Contact:<br />
                                Email: info@pirate.global
                            </p>
                            <p>
                                Responsible for content pursuant to § 18 (2) MStV: Manuel Kölman,
                                Brabanter Str. 53, 50672 Cologne
                            </p>
                        </>
                    )}
                </div>
            </Card>

            {/* Datenschutz */}
            <Card className="space-y-4">
                <h2 className="text-xl font-bold">{t.privacyTitle}</h2>
                <div className="text-gray-300 text-sm leading-relaxed space-y-4">
                    {isDe ? (
                        <>
                            <div>
                                <h3 className="font-bold text-white mb-1">1. Verantwortlicher</h3>
                                <p>
                                    Pirate GmbH, Brabanter Str. 53, 50672 Köln. E-Mail: info@pirate.global.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-white mb-1">2. Welche Daten wir verarbeiten</h3>
                                <p>
                                    WolfGang funktioniert ohne Konto und ohne Login. Wenn du ein Spiel
                                    erstellst oder einem Spiel beitrittst, verarbeiten wir:
                                </p>
                                <ul className="list-disc pl-5 space-y-1 mt-2">
                                    <li>den Anzeigenamen, den du selbst eingibst,</li>
                                    <li>ein von dir gewähltes Avatar-Symbol (Emoji),</li>
                                    <li>
                                        einen zufällig erzeugten Raum-Code und eine zufällig erzeugte
                                        Spieler-Kennung (ohne Personenbezug),
                                    </li>
                                    <li>
                                        den Spielzustand: zugewiesene Rolle, abgegebene Stimmen, Lebensstatus,
                                        Spielphase und Ergebnis.
                                    </li>
                                </ul>
                                <p className="mt-2">
                                    Du entscheidest selbst, welchen Namen du eingibst. Ein Spitzname genügt,
                                    du musst keinen echten Namen verwenden.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-white mb-1">3. Speicherung bei Google Firebase</h3>
                                <p>
                                    Diese Spieldaten werden in Google Cloud Firestore (Firebase) gespeichert,
                                    einem Dienst der Google Ireland Limited bzw. Google LLC. Firestore
                                    synchronisiert den Spielstand in Echtzeit zwischen den Geräten aller
                                    Mitspieler. Dabei kann eine Übermittlung in die USA erfolgen. Google stützt
                                    diese auf die Standardvertragsklauseln der EU-Kommission.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-white mb-1">4. Hosting</h3>
                                <p>
                                    Die Web-App wird über Vercel (Vercel Inc.) ausgeliefert. Beim Aufruf
                                    verarbeitet Vercel technisch notwendige Zugriffsdaten wie deine IP-Adresse,
                                    um die Seite bereitzustellen.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-white mb-1">5. Schriften und Analyse</h3>
                                <p>
                                    Die verwendeten Schriften (Cinzel, Inter) werden selbst ausgeliefert. Es
                                    besteht keine Verbindung zu Google Fonts. Eine Reichweiten- oder
                                    Nutzungsanalyse findet nicht statt. Firebase Analytics ist standardmäßig
                                    deaktiviert.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-white mb-1">6. Rechtsgrundlage</h3>
                                <p>
                                    Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Durchführung der von dir
                                    angefragten Spielsitzung) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes
                                    Interesse an einer funktionierenden Synchronisation zwischen den Geräten).
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-white mb-1">7. Speicherdauer</h3>
                                <p>
                                    Die Spieldaten sind flüchtiger Spielzustand. Eine automatische Löschung gibt
                                    es derzeit nicht. Spieldokumente verbleiben in Firestore, bis wir sie
                                    entfernen. Auf Anfrage an info@pirate.global löschen wir dein Spiel.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-white mb-1">8. Deine Rechte</h3>
                                <p>
                                    Du hast nach der DSGVO das Recht auf Auskunft (Art. 15), Berichtigung
                                    (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18),
                                    Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21). Außerdem kannst du
                                    dich bei einer Datenschutz-Aufsichtsbehörde beschweren (Art. 77). Wende dich
                                    dafür an info@pirate.global.
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <h3 className="font-bold text-white mb-1">1. Controller</h3>
                                <p>
                                    Pirate GmbH, Brabanter Str. 53, 50672 Cologne, Germany. Email:
                                    info@pirate.global.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-white mb-1">2. What data we process</h3>
                                <p>
                                    WolfGang works without an account and without a login. When you create or
                                    join a game, we process:
                                </p>
                                <ul className="list-disc pl-5 space-y-1 mt-2">
                                    <li>the display name you type in yourself,</li>
                                    <li>an avatar symbol (emoji) you choose,</li>
                                    <li>
                                        a randomly generated room code and a randomly generated player id (not
                                        tied to your identity),
                                    </li>
                                    <li>
                                        the game state: assigned role, votes cast, alive status, game phase and
                                        result.
                                    </li>
                                </ul>
                                <p className="mt-2">
                                    You decide which name you enter. A nickname is enough, you do not have to use
                                    a real name.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-white mb-1">3. Storage with Google Firebase</h3>
                                <p>
                                    This game data is stored in Google Cloud Firestore (Firebase), a service of
                                    Google Ireland Limited and Google LLC. Firestore syncs the game state in real
                                    time across every player's device. This can involve a transfer to the USA,
                                    which Google bases on the EU Commission's Standard Contractual Clauses.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-white mb-1">4. Hosting</h3>
                                <p>
                                    The web app is delivered via Vercel (Vercel Inc.). When the page loads,
                                    Vercel processes technically necessary access data such as your IP address in
                                    order to serve the site.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-white mb-1">5. Fonts and analytics</h3>
                                <p>
                                    The fonts we use (Cinzel, Inter) are self-hosted. There is no connection to
                                    Google Fonts. We do not run any usage or reach analytics. Firebase Analytics
                                    is disabled by default.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-white mb-1">6. Legal basis</h3>
                                <p>
                                    The legal basis is Art. 6 (1) (b) GDPR (running the game session you
                                    requested) and Art. 6 (1) (f) GDPR (legitimate interest in working
                                    cross-device synchronisation).
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-white mb-1">7. Retention</h3>
                                <p>
                                    The game data is transient game state. There is currently no automatic
                                    deletion. Game documents remain in Firestore until we remove them. On request
                                    to info@pirate.global we will delete your game.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-bold text-white mb-1">8. Your rights</h3>
                                <p>
                                    Under the GDPR you have the right to access (Art. 15), rectification
                                    (Art. 16), erasure (Art. 17), restriction of processing (Art. 18), data
                                    portability (Art. 20) and objection (Art. 21). You can also lodge a complaint
                                    with a data protection authority (Art. 77). To exercise these rights, contact
                                    info@pirate.global.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
}
