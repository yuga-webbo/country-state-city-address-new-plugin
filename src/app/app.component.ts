import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import ISO6391 from 'iso-639-1';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  addressFormGroup = new FormGroup({
    language: new FormControl('en'),
    country: new FormControl(),
    state: new FormControl(),
    county: new FormControl(),
    city: new FormControl()
  });

  ISO6391 = ISO6391;
  languages: any[];
  countries: CountryModel[];
  states: CountryModel[];
  counties: CountryModel[];
  cities: CountryModel[];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.languages = ISO6391.getLanguages(ISO6391.getAllCodes());
    this.reset('en');
  }

  async reset(lang: any) {
    this.addressFormGroup.reset();
    this.addressFormGroup.patchValue({ language: lang });

    const geoCountries = await this.getCountries();
    this.countries = geoCountries.geonames;
    console.log(this.countries);

    this.states = [];
    this.cities = [];
  }

  /**
   * populate states and cities depending on what changed
   * @param geonameId number
   * @param getChild 0: states, 1: counties, 2: cities
   */
  async selectionChange(geonameId: any, getChild?: number) {
    this.addressFormGroup.get('city').reset();

    const geoChildren = await this.getStatesAndCities(geonameId);
    switch (getChild) {
      case 0:
        this.addressFormGroup.get('state').reset();
        this.addressFormGroup.get('county').reset();
        this.states = geoChildren.geonames;
        this.counties = [];
        this.cities = [];
        break;
      case 1:
        this.addressFormGroup.get('county').reset();
        this.counties = geoChildren.geonames;
        this.cities = [];
        break;
      default:
        this.cities = geoChildren.geonames;
        break;
    }
  }

  // REST APIs
  getCountries() {
    return this.http
      .get(
        `https://secure.geonames.org/countryInfoJSON?lang=${
          this.addressFormGroup.value.language
        }&username=ahii`
      )
      .toPromise();
  }

  getStatesAndCities(geonameId: number) {
    return this.http
      .get(
        `https://secure.geonames.org/childrenJSON?geonameId=${geonameId}&lang=${
          this.addressFormGroup.value.language
        }&username=ahii`
      )
      .toPromise();
  }
}

export interface CountryModel {
  geonameId: number;
  countryName: string;
  toponymName?: string;
}
