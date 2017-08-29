import { Component, ViewEncapsulation, ViewChild, TemplateRef } from '@angular/core';
import { NotificationService, Hotkey, HotkeysService, DrawerService } from '@swimlane/ngx-ui';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import * as shape from 'd3-shape';

import { convertJSON, makeHash, makeId } from './utils/JSONconverter';

import littlealchemy from '../assets/JSONrecipes/com.sometimeswefly.littlealchemy.json';
import doodlegod_hd_free2 from '../assets/JSONrecipes/joybits.doodlegod_hd_free2.json';
import byril from '../assets/JSONrecipes/com.byril.alchemy.json';
import doodledevil_free from '../assets/JSONrecipes/com.joybits.doodledevil_free.json';
import Alchemy_Fusion_2 from '../assets/JSONrecipes/com.snowysapps.Alchemy_Fusion_2.json';
import alchemyclassic from '../assets/JSONrecipes/com.niasoft.alchemyclassic.json';

const sets = {
  'com.byril.alchemy': byril,
  'joybits.doodlegod_hd_free2': doodlegod_hd_free2,
  'com.joybits.doodledevil_free': doodledevil_free,
  'com.snowysapps.Alchemy_Fusion_2': Alchemy_Fusion_2,
  'com.sometimeswefly.littlealchemy': littlealchemy,
  'com.niasoft.alchemyclassic': alchemyclassic
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['../../node_modules/@swimlane/ngx-ui/release/index.css', './app.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: '0' }),
        animate('.5s ease-out', style({ opacity: '0.7' })),
      ]),
    ])
  ]
})
export class AppComponent {
  title = 'Alchemy Lab';

  sets = sets;
  setNames = Object.keys(sets);
  currentSet = 'com.sometimeswefly.littlealchemy';

  names: any;
  filter = '';

  orderableList = [];
  filteredItems = [];

  workbenchList = [];

  recipes: any;
  recipesIndex: any = {};

  hierarchialGraph = { links: [], nodes:  [] };
  curve: any = shape.curveBundle.beta(1);
  colorScheme = {
    name: 'vivid',
    selectable: true,
    group: 'Ordinal',
    domain: [
      '#647c8a', '#3f51b5', '#2196f3', '#00b862', '#afdf0a', '#a7b61a', '#f3e562', '#ff9800', '#ff5722', '#ff4514'
    ]
  };

  showAllGraph = false;

  @ViewChild('editTmpl') editTmpl: TemplateRef<any>;

  constructor(private notificationService: NotificationService, private drawerMngr: DrawerService) {
    this.loadSet('com.sometimeswefly.littlealchemy');
  }

  updateGraph() {
    const recipes = this.showAllGraph ?
      this.recipes.slice() :
      this.recipes.filter(r => r.found);

    const nodes = this.orderableList;

    this.hierarchialGraph.nodes = <any>nodes.map(name => ({value: name, label: name, id: makeId(name)}));
    this.hierarchialGraph.links = [];

    recipes.forEach(r => {
      r.ingredients.forEach(source => {
        r.results.forEach(target => {
          this.hierarchialGraph.links.push({
            source: makeId(source),
            target: makeId(target)
          });
        });
      });
    });
  }

  addItem(item) {
    this.workbenchList.push(item);
    this.onChange();
  }

  removeItem(item) {
    const i = this.workbenchList.indexOf(item);
    if (i !== -1) {
      this.workbenchList.splice(i, 1);
      this.onChange();
    }
  }

  onChange(ev?: any) {
    const hashedInput = makeHash(this.workbenchList);
    const result = this.recipes.find(f => {
      return !f.found && f.hash === hashedInput;
    });
    if (result) {
      this.onFound(result);
    }
  }

  onFound(result) {
    result.found = true;
    this.workbenchList = [...result.results];
    result.results.forEach(r => {
      if (!this.recipesIndex[r]) {
        this.recipesIndex[r] = [result.hash];
      } else {
        this.recipesIndex[r].push(result.hash);
      }
    });
    const items = result.results.filter(i => !this.orderableList.includes(i));
    if (items.length) {
      this.onCreated(items);
    }
    this.updateGraph();
  }

  onCreated(items) {
    const filtered = items.filter(i => !this.orderableList.includes(i));
    if (filtered.length) {
      this.orderableList.push(...filtered);
      this.orderableList.sort();
      this.updateFilter(this.filter);
    }
    this.notificationService.create({
      title: 'Item Discovered',
      body: `You discovered ${items.join(' ')}`,
      styleType: 'success',
      rateLimit: false
    });
  }

  updateFilter(value) {
    this.filter = value || '';
    if (typeof value !== 'string' || value.trim().length === 0) {
      return this.filteredItems = this.orderableList.slice();
    }
    value = value.toLowerCase();
    return this.filteredItems = this.orderableList.filter(v => v.toLowerCase().includes(value));
  }

  getRecipes(item) {
    if (this.recipesIndex[item]) {
      return item + '<hr />' + this.recipesIndex[item].join('<br />');
    }
    return item;
  }

  @Hotkey('ctrl+s', 'Do some magic!')
  onKey() {
    this.showAllGraph = !this.showAllGraph;
    this.updateGraph();
  }

  openDrawer(direction = 'left', size = 80) {
    this.drawerMngr.create({
      direction,
      template: this.editTmpl,
      size,
      context: 'Alchemy Lab'
    });
  }

  loadSet(key: string) {
    this.currentSet = key;
    const inputJSON = sets[key];
    const { recipes, names } = convertJSON(inputJSON);
    this.recipes = recipes;
    this.names = names;

    this.orderableList = [
      'Water',
      'Fire',
      'Earth',
      'Air'
    ].sort();
    this.filteredItems = [...this.orderableList];

    this.updateGraph();
  }

  objectKeys(obj) {
    return Object.keys(obj);
  }
}
