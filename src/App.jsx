import { useState, useEffect, useRef } from 'react';
import './App.css';
import waterEnergy from './assets/images/basicWaterEnergy.jpg';
import psychicEnergy from './assets/images/basicPsychicEnergy.jpg';
import metalEnergy from './assets/images/basicMetalEnergy.jpg';
import lightningEnergy from './assets/images/basicLightningEnergy.jpg';
import fireEnergy from './assets/images/basicFireEnergy.jpg';
import grassEnergy from './assets/images/basicGrassEnergy.jpg';
import fightingEnergy from './assets/images/basicFightingEnergy.jpg';
import darkEnergy from './assets/images/basicDarkEnergy.jpg';


function App() {

    const [deckList, setDeckList] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [sampleHands, setSampleHands] = useState([]);
    const [handImages, setHandImages] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDeckList((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files ? e.target.files[0] : null;
        setSelectedFile(file);

        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const fileContent = event.target.result;
                setDeckList((prevData) => ({
                    ...prevData,
                    deck: fileContent
                }));
            };
            reader.readAsText(file);
        }
    };

    const clearHands = () => {
        setHandImages([]); // Reset sampleHands to an empty array
    };

    const parseDeck = () => {
        return deckList.deck
            .split('\n')
            .filter(line => line.trim() !== '' && !/^(Pokémon:|Trainer:|Energy:|Total Cards:)/.test(line))
            .map(line => line.replace(/\sPH$/, ''))
            .flatMap(line => {
                const match = line.match(/^(\d+)\s+(.+)$/);
                if (match) {
                    const quantity = parseInt(match[1], 10);
                    const cardName = match[2];
                    return Array(quantity).fill(cardName);
                }
                return [line];
            });
    };

// Mapping object for set codes
    const setCodeMapping = {
        SVI: "sv01",
        PAL: "sv02",
        OBF: "sv03",
        MEW: "sv03.5",
        PAR: "sv04",
        PAF: "sv04.5",
        TEF: "sv05",
        TWM: "sv06",
        SFA: "sv06.5",
        SCR: "sv07",
        SSP: "sv08",
        SSH: "swsh1",
        RCL: "swsh2",
        DAA: "swsh3",
        CPA: "swsh3.5",
        VIV: "swsh4",
        SHF: "swsh4.5",
        BST: "swsh5",
        CRE: "swsh6",
        EVS: "swsh7",
        FST: "swsh8",
        BRS: "swsh9",
        ASR: "swsh10",
        PGO: "swsh10.5",
        LOR: "swsh11",
        SIT: "swsh12",
        CRZ: "swsh12.5",
        PR: "swshp",
        CEL: "cel25",
        XY: "xy1",
        FLF: "xy2",
        FFI: "xy3",
        PHF: "xy4",
        PRC: "xy5",
        ROS: "xy6",
        AOR: "xy7",
        BKT: "xy8",
        BKP: "xy9",
        FCO: "xy10",
        STS: "xy11",
        EVO: "xy12",
        DCR: "dc1",
        GEN: "g1",
        SUM: "sm1",
        GRI: "sm2",
        BUS: "sm3",
        CIN: "sm4",
        UPR: "sm5",
        FLI: "sm6",
        CES: "sm7",
        LOT: "sm8",
        TEU: "sm9",
        UNB: "sm10",
        UNM: "sm11",
        CEC: "sm12",
        SLG: "sm3.5",
        DRM: "sm7.5",
        DET: "det1",
        HIF: "sm115",

    };

    const energyImageMapping = {
        "{W}": waterEnergy,
        "{P}": psychicEnergy,
        "{M}": metalEnergy,
        "{L}": lightningEnergy,
        "{R}": fireEnergy,
        "{G}": grassEnergy,
        "{F}": fightingEnergy,
        "{D}": darkEnergy,
    };

    const extractSetIdAndCardId = (cardName) => {
        const parts = cardName.split(" ");

        if (parts.length < 3) {
            console.error(`Unexpected format for card name "${cardName}"`);
            return ["", ""];
        }

        const setCode = parts[parts.length - 2];
        let cardId = parts[parts.length - 1];
        const mappedSetId = setCodeMapping[setCode];

        if (!mappedSetId) {
            console.warn(`Set code "${setCode}" not found in mapping for card "${cardName}".`);
            return ["", ""];
        }

        const threeDigitSets = ["sv", "swsh9", "swsh10", "swsh10.5", "swsh11", "swsh12", "swsh12.5"];
        if (threeDigitSets.some(prefix => mappedSetId.startsWith(prefix))) {
            cardId = cardId.padStart(3, '0');
        }

        return [mappedSetId, cardId];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const cardArray = parseDeck();
        if (cardArray.length < 7) {
            alert("Deck must contain at least 7 cards to generate a hand.");
            return;
        }

        const fetchBound = fetch.bind(window);
        let hand = [];
        let handImagesArray = [];
        let containsBasicPokemon = false;

        do {
            hand = cardArray.sort(() => 0.5 - Math.random()).slice(0, 7);

            handImagesArray = [];
            containsBasicPokemon = false;

            await Promise.all(
                hand.map(async (cardName) => {
                    console.log(`Processing card: ${cardName}`);

                    const energyMatch = cardName.match(/Basic \{(\w)\} Energy/);
                    if (energyMatch) {
                        const energySymbol = `{${energyMatch[1]}}`;
                        console.log(`Energy card detected: ${energySymbol}`);
                        handImagesArray.push(energyImageMapping[energySymbol] || "/path/to/default-energy.jpg");
                        return;
                    }

                    try {
                        let [setId, cardId] = extractSetIdAndCardId(cardName);
                        const threeDigitSets = ["sv", "swsh9", "swsh10", "swsh10.5", "swsh11", "swsh12", "swsh12.5"];
                        if (threeDigitSets.some(prefix => setId.startsWith(prefix))) {
                            cardId = cardId.padStart(3, '0');
                        }

                        const response = await fetchBound(`https://api.tcgdex.net/v2/en/cards/${setId}-${cardId}`);
                        const cardData = await response.json();

                        console.log(`Fetched card data for: ${cardData.name}`);
                        if (cardData.category === "Pokemon" && cardData.stage === "Basic") {
                            containsBasicPokemon = true;
                        }

                        const quality = "high";
                        const extension = "png";
                        handImagesArray.push(cardData.image ? `${cardData.image}/${quality}.${extension}` : "/path/to/default-card.jpg");
                    } catch (error) {
                        console.error("Error fetching card data for:", cardName, error);
                        handImagesArray.push("/path/to/default-card.jpg");
                    }
                })
            );
        } while (!containsBasicPokemon);

        setSampleHands((prevHands) => [...prevHands, hand]);
        setHandImages((prevImages) => [...prevImages, handImagesArray]);
    };

    const scrollToTop = () => {
        const container = document.querySelector('.testHandsContainer');
        if (container) {
            container.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        }
    };


    return(
        <div>
            <div className="mainContainer">
                <div className="navigationBar">
                    <p className="headerTextBold">Pokemon Test Hand Generator</p>
                    <p className="headerText">Github</p>
                </div>
                <div className="mainBody">
                    <div className="inputDeck">
                        <p className="mainText">Deck</p>
                        <form onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="deck"></label>
                                <textarea
                                    className="deckInputDiv"
                                    id="deck"
                                    name="deck"
                                    value={deckList.deck}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="inputRow">
                                <button className="generateButton" type="submit">Generate ⚡️</button>
                                <label htmlFor="fileInput" className="fileButton">Choose File 📂</label>
                                <input
                                    type="file"
                                    id="fileInput"
                                    className="hiddenFileInput"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </form>
                    </div>
                    <div className="testHands">
                        <div className="topRow">
                            <p className="mainText">Test Hands</p>
                        </div>
                        <div className="testHandsContainer">
                            {handImages.map((images, handIndex) => (
                                <div key={handIndex} className="cardRow">
                                    {images.map((image, index) => (
                                        <img key={index} src={image} alt={`Card ${index + 1}`} className="cardImage"/>
                                    ))}
                                </div>
                            ))}
                            {handImages.length >= 4 && (
                                <button className="scrollTopButton" onClick={scrollToTop}>
                                    Back to Top ⬆️
                                </button>
                            )}
                        </div>
                        <button onClick={clearHands} className="clearButton">Clear 🗑️</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App;
