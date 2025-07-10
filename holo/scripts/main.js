class Syntax {
    analysis(text) {
        const words = text.split(/\s/);
        let actualAction = 0;
        let actions = [];
        actions.push({
            func: null,
            properties: [],
        })
        let keyWords = [];
        let adjectives = [];
        for(let word of words) {
            let lowerCase = word.toLowerCase()/*.replace(/.|,/g, '');*/
            if(lowerCase.endsWith('\'s') || lowerCase.endsWith('\'')) {
                console.log('possesive detected')
                lowerCase = lowerCase.replace(/'*s/, '')
                for(const n in this.names) {
                    if(this.names[n][0] == lowerCase) {
                        adjectives = [{
                            type: 'possesive', 
                            plural: false,
                            name: +n,
                            adjectives,
                            keyWords,
                        }]
                        keyWords = [];
                        break;
                    } else if(this.names[n][1] == lowerCase) {
                        adjectives = [{
                            type: 'possesive', 
                            plural: true,
                            name: +n,
                            adjectives,
                            keyWords,
                        }]
                        keyWords = [];
                        break;
                    }
                }
                continue;
            }

            let ended = false;
            for(const n in this.functions) {
                console.log(n, this.functions, lowerCase);
                if(this.functions[n][0] == lowerCase) {
                    actions[actualAction].func = +n;
                    ended = true;
                    break;
                }
            }
            if(ended) continue;


            for(const n in this.names) {
                if(this.names[n][0] == lowerCase) {
                    actions[actualAction].properties.push({
                        type: 'name', 
                        plural: false,
                        name: +n,
                        keyWords,
                        adjectives,
                    })
                    ended = true;
                    keyWords = [];
                    adjectives = [];
                    break;
                } else if(this.names[n][1] == lowerCase) {
                    actions[actualAction].properties.push({
                        type: 'name', 
                        plural: true,
                        name: +n,
                        keyWords,
                        adjectives,
                    })
                    ended = true;
                    keyWords = [];
                    adjectives = [];
                    break;
                }
            }
            if(ended) continue;

            for(const n in this.adjectives) {
                if(this.adjectives[n] == lowerCase) {
                    ended = true;
                    adjectives.push({
                        type: 'describe',
                        name: +n,
                    });
                    ended = true;
                    break;
                }
            }
            if(ended) continue;

            for(const n in this.states) {
                if(this.states[n] == lowerCase) {
                    actions[actualAction].properties.push({
                        type: 'state', 
                        name: +n,
                    })
                    ended = true;
                    keyWords = [];
                    break;
                }
            }
            if(ended) continue;


            for(const n in this.keyWords) {
                if(this.keyWords[n] == lowerCase) {
                    ended = true;
                    keyWords.push(+n);
                    break;
                }
            }
            if(ended) continue;


            else {
                actions[actualAction].properties.push({
                    type: 'text', 
                    text: word,
                    keyWords,
                })
                ended = true;
                keyWords = [];
                break;
            }

        }
        return actions;
    }
    refersTo(property1, property2) {
        if(property1.name != property2.name) return false;
        let always = false;
        if(property1.isPlural || property1.keyWords.indexOf(3) != -1)
            always = true;
        for(const adjective of property1.adjectives) {
            if(property2.adjectives.findIndex((adj) => {
                if(adjective.type == 'describe') {
                    return adj.type == 'describe' && adj.name == adjective.name;
                } else if(adjective.type == 'possesive') {
                    return adj.type == 'possesive' && adj.name == adjective.name;
                }
            }) == -1) return false;
        }
        return {always};
    }
    
    functions = [
        ['turn'],
        ['close'],
    ]
    names = [
        ['light', 'lights'],
        ['door', 'doors'],
        ['room', 'rooms'],
        ['kitchen', 'kitchens'],
        ['toaster', 'toasters'],
    ]
    states = [
        'off',
        'on',
        'open',
        'closed'
    ]
    keyWords = [
        'the',
        'a',
        'one',
        'all',
        'an'
    ]
    adjectives = [
        'blue',
        'living',
        'dining',
        'open',
        'closed'
    ]
}

const syntax = new Syntax();


const houseFunctions = [
    (properties) => {
        
    }
]

