import axios from 'axios';
import { URLDescriptor } from './URLDescriptor';
import { URLs } from './URLs';
import { writeFileSync } from 'fs';

type DataLine = {
    date: string,
    autorises: number,
    refuses: number,
    sansSuite: number,
};

type ResultLine = {
    dept: string,
    deptName: string,
    date: string,
    autorises: number,
    refuses: number,
    sansSuite: number,
}

const getMonthNumber = (month: string): string => {
    if(month === 'fév.') {
        return '02';
    } else if (month === 'mars') {
        return '03';
    } else if (month === 'avr.') {
        return '04';
    } else if (month === 'mai') {     
        return '05';
    } else if (month === 'juin') {
        return '06';
    } else if(month === 'juil.') {
        return '07';
    } else {
        return '##';
    }
}

const processData = (annee: string, data: any[]) => {
    const result: DataLine[] = [];
    data.forEach((element: any) => {
        const status = element.name;
        element.data.forEach((value: any) => {
            const [strDate, nb] = value;
            const [jour, mois] = strDate.split(' ');
            const strMois = getMonthNumber(mois);
            const strJour = jour.padStart(2, '0');
            const resultDate = `${annee}${strMois}${strJour}`;
            const resultLine = result.find(line => line.date === resultDate);
            if (resultLine === undefined) {
                var autorises = 0;
                var refuses = 0;
                var sansSuite = 0;
                    if (status === 'accepte') {
                    autorises = nb;
                } else if (status === 'refuse') {
                    refuses = nb;
                } else if (status === 'sans_suite') {
                    sansSuite = nb;
                }
                const newLine: DataLine = {
                    date: resultDate,
                    autorises,
                    refuses,
                    sansSuite,
                };
                result.push(newLine);
            } else {
                if (status === 'accepte') {
                    resultLine.autorises = nb;
                } else if (status === 'refuse') {
                    resultLine.refuses = nb;
                } else if (status === 'sans_suite') {
                    resultLine.sansSuite = nb;
                }
            }
        });
    });
    return result;
}

const processURL = async (url: URLDescriptor) => {
    console.log(`Lecture des données pour le département ${url.deptName}...`);
    // download the page using axios
    const targetURL = `https://www.demarches-simplifiees.fr/statistiques/${url.urlKey}`;
    const response = await axios.get(targetURL);
    const pageContent: string = response.data;
    // split pageContent into lines
    const lines = pageContent.split('\n');
    const matchingLines = lines.filter(line => line.includes('(\"chart-4'));
    if (matchingLines.length !== 1) {
        console.log(`The webpage for departement ${url.dept} returns an unexpected page`);
        return [];
    }
    const chartLine = matchingLines[0];
    const startingPos = chartLine.indexOf('[{\"name\":');
    const endingPos = chartLine.indexOf(', {\"colors\":');
    if (startingPos === -1) {
        console.log(`Pas de données pour le département ${url.deptName}`);
        return [];
    }
    const chartData = JSON.parse(chartLine.substring(startingPos, endingPos));
    const dataValues = processData(url.annee, chartData);
    const result: ResultLine[] =  dataValues.map((dataValue) => {
        return {
            dept: url.dept,
            deptName: url.deptName,
            date: dataValue.date,
            autorises: dataValue.autorises,
            refuses: dataValue.refuses,
            sansSuite: dataValue.sansSuite,
        };
    });
    return result;
}

const getFormattedDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Months are 0 based, so +1 and pad with 0
    const day = ('0' + date.getDate()).slice(-2);
    const dateString = `${year}${month}${day}`;
    return dateString;
}

const writeCsv = (results: ResultLine[], fileName: string) => {
    const header = 'dept,nom_dept,date,autorises,refuses,sans_suite\n';
    writeFileSync(fileName, header, { flag: 'w' });
    results.forEach(item => {
        const line = `"${item.dept}","${item.deptName}","${item.date}",${item.autorises},${item.refuses},${item.sansSuite}\n`;
        writeFileSync(fileName, line, { flag: 'a' });
    })
}

const main = async () => {
    const results: ResultLine[] = [];
    for (const url of URLs) {
        const current = await processURL(url);
        results.push(...current);
    }
    const fileName = `stats-${getFormattedDate()}.csv`;
    writeCsv(results, fileName);
    console.log(`${results.length} lignes écrites dans le fichier CSV ${fileName}`);
}

main().then(() => console.log('Fini!'));
