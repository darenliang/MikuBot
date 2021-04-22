export function pad(pad: string, str: string, padLeft: boolean): string {
    if (typeof str === 'undefined')
        return pad;
    if (padLeft) {
        return (pad + str).slice(-pad.length);
    } else {
        return (str + pad).substring(0, pad.length);
    }
}

export function capitalize(str: string): string {
    return str[0].toUpperCase() + str.slice(1);
}

export function perms(strArr: string[]): string {
    return strArr.map(permission => `\`${permission.toString().toLowerCase().split('_').join(' ')}\``).join(', ');
}

export function msToTime(duration: number): string {
    let seconds = Math.floor(duration / 1000);
    let minute = Math.floor(seconds / 60);
    seconds = seconds % 60;
    const hour = Math.floor(minute / 60);
    minute = minute % 60;
    return `${pad('00', hour.toString(), true)}:${pad('00', minute.toString(), true)}:${pad('00', seconds.toString(), true)}`;
}

export function getEmojiNumber(value: number): string {
    switch (value) {
        case 0:
            return '0️⃣';
        case 1:
            return '1️⃣';
        case 2:
            return '2️⃣';
        case 3:
            return '3️⃣';
        case 4:
            return '4️⃣';
        case 5:
            return '5️⃣';
        case 6:
            return '6️⃣';
        case 7:
            return '7️⃣';
        case 8:
            return '8️⃣';
        case 9:
            return '9️⃣';
        default:
            return '';
    }
}

export function getValueFromEmoji(emoji: string): number {
    switch (emoji) {
        case '0️⃣':
            return 0;
        case '1️⃣':
            return 1;
        case '2️⃣':
            return 2;
        case '3️⃣':
            return 3;
        case '4️⃣':
            return 4;
        case '5️⃣':
            return 5;
        case '6️⃣':
            return 6;
        case '7️⃣':
            return 7;
        case '8️⃣':
            return 8;
        case '9️⃣':
            return 9;
        default:
            return -1;
    }
}

export function ordinalSuffixOf(i: number) {
    let j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + 'st';
    }
    if (j == 2 && k != 12) {
        return i + 'nd';
    }
    if (j == 3 && k != 13) {
        return i + 'rd';
    }
    return i + 'th';
}

export function shuffleArr(a: any) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export function getUrlExtension(url: string) {
    return url.split(/[#?]/)[0].split('.').pop()!.trim();
}
