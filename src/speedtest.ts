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
    const [latency, jitterString, lowString, highString] = value.split(/[():]/);
    const jitter = jitterString?.replace('jitter', '').trim() || null;
    const low = lowString?.replace('low', '').trim() || null;
    const high = highString?.replace('high', '').trim() || null;
    return {
        latency: latency?.trim() || '',
        jitter,
        low,
        high
    };
};

export const convert = (data: string[]) => {
    console.log("===== [Log] =====")
    console.log(data);
    console.log("=================")

    const jsonData: Partial<SpeedTestResult> = {};

    for (let i = 0; i < data.length; i++) {
        const [key, value] = data[i].split(':');

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
                jsonData[key] = `https://${value}`;
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