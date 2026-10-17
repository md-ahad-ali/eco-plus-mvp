import React, { useEffect } from "react";

const PrivacyPolicy = () => {
    useEffect(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);
  return (
    <div className="p-6 md:max-w-5xl mx-auto">
      {/* Impressum Section */}
      <section className="mb-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-8">
          Impressum
        </h1>
        <p className="mb-2 text-base sm:text-lg">
          <strong>By Transport</strong>
          <br />
          Voltastr. 10, 63457 Hanau, Deutschland
        </p>

        <p className="mb-2 text-base sm:text-lg">
          <strong>Telefon:</strong> +49 4154 5924016
          <br />
          <strong>E-Mail:</strong> info@by-transport.de
        </p>
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mt-4 mb-2">
        Vertretungsberechtigter
        </h2>
        <p className="mb-2 text-base sm:text-lg">
        Geschäftsführer: Kaya Ali Hanau
        </p>
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mt-4 mb-2">
        Register
        </h2>
        <p className="mb-2 text-base sm:text-lg">
          Eintragung im Handelsregister.
          <br />
          <strong>Registergericht:</strong> Amtsgericht Hanau
          <br />
          <strong>Registernummer:</strong> HRB 92044
        </p>
        {/* <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mt-4 mb-2">
          Umsatzsteuer-Identifikationsnummer
        </h2>
        <p className="mb-2 text-base sm:text-lg">
          Gemäß § 27 a Umsatzsteuergesetz: DE247501028
        </p> */}
      </section>

      {/* Datenschutzerklärung Section */}
      <section>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-8">
          Datenschutzerklärung
        </h1>
        <h2 className="text-2xl sm:text-3xl md:text-3xl font-semibold mt-4 mb-2">
          1. Allgemeine Informationen
        </h2>
        <p className="mb-4 text-base sm:text-lg">
        Der Schutz Ihrer persönlichen Daten ist uns wichtig. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
        </p>
        <h2 className="text-2xl sm:text-3xl md:text-3xl font-semibold mt-4 mb-2">
          2. Verantwortliche Stelle
        </h2>
        <p className="mb-4 text-base sm:text-lg">
          Die verantwortliche Stelle für die Datenverarbeitung auf dieser
          Website ist:
        </p>
        <p className="mb-4 text-base sm:text-lg">
        By Transport
          <br />
          Voltastr. 10, 63457 Hanau, Deutschland
          <br />
          <strong>Telefon:</strong> +49 4154 5924016
          <br />
          <strong>E-Mail:</strong> info@by-transport.de
        </p>
        <h2 className="text-2xl sm:text-3xl md:text-3xl font-semibold mt-4 mb-2">
          3. Erhebung und Speicherung personenbezogener Daten sowie Art und
          Zweck von deren Verwendung
        </h2>
        <p className="mb-4 text-base sm:text-lg">
          Beim Besuch der Website: Beim Aufrufen unserer Website werden durch
          den auf Ihrem Endgerät zum Einsatz kommenden Browser automatisch
          Informationen an den Server unserer Website gesendet. Diese
          Informationen werden temporär in einem sogenannten Logfile
          gespeichert. Folgende Informationen werden dabei ohne Ihr Zutun
          erfasst und bis zur automatisierten Löschung gespeichert:
        </p>
        <ul className="list-disc pl-6 mb-4 text-base sm:text-lg">
          <li>IP-Adresse des anfragenden Rechners</li>
          <li>Datum und Uhrzeit des Zugriffs</li>
          <li>Name und URL der abgerufenen Datei</li>
          <li>Website, von der aus der Zugriff erfolgt (Referrer-URL)</li>
          <li>
            Verwendeter Browser und ggf. das Betriebssystem Ihres Rechners sowie
            der Name Ihres Access-Providers
          </li>
        </ul>
        <p className="mb-4 text-base sm:text-lg">
          Die genannten Daten werden durch uns zu folgenden Zwecken verarbeitet:
        </p>
        <ul className="list-disc pl-6 mb-4 text-base sm:text-lg">
          <li>
            Gewährleistung eines reibungslosen Verbindungsaufbaus der Website
          </li>
          <li>Gewährleistung einer komfortablen Nutzung unserer Website</li>
          <li>Auswertung der Systemsicherheit und -stabilität</li>
          <li>Weitere administrative Zwecke</li>
        </ul>
        <h2 className="text-2xl sm:text-3xl md:text-3xl font-semibold mt-4 mb-2">
          4. Weitergabe von Daten
        </h2>
        <p className="mb-4 text-base sm:text-lg">
          Eine Übermittlung Ihrer persönlichen Daten an Dritte findet nur statt,
          wenn:
        </p>
        <ul className="list-disc pl-6 mb-4 text-base sm:text-lg">
          <li>Sie Ihre ausdrückliche Einwilligung dazu erteilt haben</li>
          <li>
            die Verarbeitung zur Abwicklung eines Vertrags mit Ihnen
            erforderlich ist
          </li>
          <li>eine rechtliche Verpflichtung zur Weitergabe besteht</li>
          <li>
            die Weitergabe zur Wahrung berechtigter Interessen erforderlich ist
            und kein Grund zur Annahme besteht, dass Sie ein überwiegendes
            schutzwürdiges Interesse an der Nichtweitergabe Ihrer Daten haben
          </li>
        </ul>
        <h2 className="text-2xl sm:text-3xl md:text-3xl font-semibold mt-4 mb-2">
          5. Ihre Rechte als Betroffener
        </h2>
        <p className="mb-4 text-base sm:text-lg">Sie haben das Recht:</p>
        <ul className="list-disc pl-6 mb-4 text-base sm:text-lg">
          <li>
            gemäß Art. 15 DSGVO Auskunft über Ihre von uns verarbeiteten
            personenbezogenen Daten zu verlangen
          </li>
          <li>
            gemäß Art. 16 DSGVO unverzüglich die Berichtigung unrichtiger oder
            Vervollständigung Ihrer bei uns gespeicherten personenbezogenen
            Daten zu verlangen
          </li>
          <li>
            gemäß Art. 17 DSGVO die Löschung Ihrer bei uns gespeicherten
            personenbezogenen Daten zu verlangen
          </li>
          <li>
            gemäß Art. 18 DSGVO die Einschränkung der Verarbeitung Ihrer
            personenbezogenen Daten zu verlangen
          </li>
          <li>
            gemäß Art. 20 DSGVO Ihre personenbezogenen Daten in einem
            strukturierten, gängigen und maschinenlesbaren Format zu erhalten
            oder die Übermittlung an einen anderen Verantwortlichen zu verlangen
          </li>
          <li>
            gemäß Art. 7 Abs. 3 DSGVO Ihre einmal erteilte Einwilligung
            jederzeit gegenüber uns zu widerrufen
          </li>
          <li>
            gemäß Art. 77 DSGVO sich bei einer Aufsichtsbehörde zu beschweren
          </li>
        </ul>
        <h2 className="text-2xl sm:text-3xl md:text-3xl font-semibold mt-4 mb-2">
          6. Datensicherheit
        </h2>
        <p className="mb-4 text-base sm:text-lg">
          Wir verwenden innerhalb des Website-Besuchs das verbreitete
          SSL-Verfahren (Secure Socket Layer) in Verbindung mit der jeweils
          höchsten Verschlüsselungsstufe, die von Ihrem Browser unterstützt
          wird.
        </p>
        <h2 className="text-2xl sm:text-3xl md:text-3xl font-semibold mt-4 mb-2">
          7. Aktualität und Änderung dieser Datenschutzerklärung
        </h2>
        <p className="mb-4 text-base sm:text-lg">
          Diese Datenschutzerklärung ist aktuell gültig und hat den Stand [Datum
          einfügen].
          <br />
          Durch die Weiterentwicklung unserer Website und Angebote oder aufgrund
          geänderter gesetzlicher Vorgaben kann es notwendig werden, diese
          Datenschutzerklärung zu ändern.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
