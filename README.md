# VEditor

VEditor jest to edytor plików dla VEngine, to narzędzie zostało stworzone w celu łatwej obsługi Silnika oraz dla wygody artystów.  Również jest przyjazny dla programistów, którzy chcą stworzyć własne moduły bądź dodatki. Jest całkowicie oparty na rozwiązaniach wieloplatformowych takich jak node.js i electron.

## Uruchomienie

Do uruchomienia potrzebujemy node.js to możemy znaleźć na stronie https://nodejs.org

```sh
git clone https://github.com/VOrganization/VEditor.git
cd VEditor
npm install
npm start
```

## Kompilacja

Kompilujemy pod używany obecnie system
```sh
npm run build
```

Kompilujemy pod wszystkie platformy

```sh
npm run build all
```

## Tworzenie dodatków

Dodatki mają rozszerzenie *.node.js I zawierają wewnątrz siebie główną klasa. Gotowy dodatek umieszczamy  w folderze Plugins

### Przykład:
```js
module.exports = class{

    constructor(){
        this.type = ""; // rodzaj dodatku
        this.name = ""; // nazwa dodatku
        this.priority = 0; // priorytet wykonywania callback’ów

        this.containerName = "tmp"; // nazwa klasy kontenera HTML
        this.html = ""; // zawartość kontenera HTML

        this.saveCallback = null; // zapisywanie projektu
        this.loadCallback = null; // lądowanie projektu
        this.exportCallback = null; // eksportowanie sceny
        this.importCallback = null; // importowanie sceny
        this.createCallback = null; // tworzenie projektu
        this.exitCallback = null; // zamykanie okna
        this.selectCallback = null; // zaznaczanie elementu
        this.changeDataCallback = null; // zmiana danych na scenie
    }

    destroy(){
        //czyszczenie danych
    }

    setContainer(jqueryObject, editor){
        //ustawianie kontenera i edytora
    }

}
```

### Rodzaje
* display - to dodatek, Który tworzy kontent html i pojawia się na pasku w zakładce View
* calculation - to dodatek, który wykonywuje się jedynie w tle i służy do obliczeń na danych

## Autorzy
* Wiktor "wiktortr" Trybulec – główny programista i pomysłodawca projektu

## Kontakt
W razie pytań proszę pisać na email: wiktortr9@gmail.com

## Zewnętrzne biblioteki
* [Fontello](http://fontello.com) - MIT License
* [Golden Layout](https://golden-layout.com) - MIT License
* [jQuery](https://jquery.com) - MIT License
* [Three.js](https://threejs.org) - MIT License
* [Electron](https://electronjs.org) - MIT License
* [Electron Packager](https://github.com/electron-userland/electron-packager) - BSD 2-Clause "Simplified" License
* [Node.js](https://nodejs.org/) - MIT License

## Licencja
GNU General Public License v3.0
