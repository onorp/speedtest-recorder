interface SpeedTestResult {
    Server: {
        name: string;
        id: number;
    };
    ISP: string;
    IdleLatency: {
        latency: string;
        jitter: string | null;
        low: string | null;
        high: string | null;
    };
    Download: {
        speed: string;
        dataused: string | null;
        Ping: {
            latency: string;
            jitter: string | null;
            low: string | null;
            high: string | null;
        };
    };
    Upload: {
        speed: string;
        dataused: string | null;
        Ping: {
            latency: string;
            jitter: string | null;
            low: string | null;
            high: string | null;
        };
    };
    PacketLoss: number;
    ResultURL: string;
}

const parseLatencyData = (value: string) => {
    const [latency, jitterTitle, jitterString, lowString, highString] = value.split(/[():]/);
    const jitter = jitterString?.replace(',low', '').trim() || null;
    const low = lowString?.replace(',high', '').trim() || null;
    const high = highString || null;
    return {
        latency: latency?.trim() || '',
        jitter,
        low,
        high
    };
};

export const convert = (data: string[]) => {
    const jsonData: Partial<SpeedTestResult> = {};

    for (let i = 0; i < data.length; i++) {
        const splitData = data[i].split(':');

        const key = splitData[0];
        let value = "";
        for (let j = 1; j < splitData.length; j++) {
            value += splitData[j] + (j == splitData.length - 1 ? "" : ":");
        }

        if (!key || !value) continue;

        switch (key) {
            case 'Server':
                const [serverName, idString] = value.split('(id:');
                const id = parseInt(idString);
                jsonData[key] = {
                    name: serverName.trim(),
                    id
                };
                break;
            case 'ResultURL':
                jsonData[key] = `${value}`;
                break;
            case 'Download':
            case 'Upload':
                const [speed, dataUsedString] = value.split('(dataused:');
                const dataUsed = dataUsedString ? dataUsedString.replace(')', '').trim() : null;
                const pingData = data[++i];
                jsonData[key] = {
                    speed: speed.trim(),
                    dataused: dataUsed,
                    Ping: parseLatencyData(pingData)
                };
                break;
            case 'IdleLatency':
                jsonData[key] = parseLatencyData(`${value})`);
                break;
            case 'PacketLoss':
                jsonData[key] = parseFloat(value);
                break;
        }
    }


    return jsonData;
};