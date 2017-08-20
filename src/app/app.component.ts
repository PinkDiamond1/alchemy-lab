import { Component, ViewEncapsulation } from '@angular/core';
import { NotificationService } from '@swimlane/ngx-ui';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import * as shape from 'd3-shape';

import { recipes, names } from '../recipies/littlealchemy';

function makeHash(input) {
  return [...input].sort().join(' + ');
}

function makeId(input) {
  return input.toLowerCase().replace(/\s/g, '');
}

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

  names = names;
  filter = '';

  orderableList = [
    'Water',
    'Fire',
    'Earth',
    'Air'
  ].sort();
  filteredItems = [...this.orderableList];

  workbenchList = [];

  recipies: any = recipes;
  recipiesIndex: any = {};

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

  constructor(private notificationService: NotificationService) {
    this.recipies.forEach(r => {
      r.hash = makeHash(r.ingredients);
    });
    this.updateGraph();
  }

  updateGraph() {
    const recepies = this.recipies.filter(r => r.found);
    const nodes = this.orderableList;

    this.hierarchialGraph.nodes = <any>nodes.map(name => ({value: name, label: name, id: makeId(name)}));
    this.hierarchialGraph.links = [];

    recepies.forEach(r => {
      r.ingredients.forEach(source => {
        r.results.forEach(target => {
          this.hierarchialGraph.links.push({
            source: makeId(source),
            target: makeId(target)
          });
        });
      });
    });

    console.log(this.hierarchialGraph);
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
    const result = this.recipies.find(f => {
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
      if (!this.recipiesIndex[r]) {
        this.recipiesIndex[r] = [result.hash];
      } else {
        this.recipiesIndex[r].push(result.hash);
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

  getRecipies(item) {
    if (this.recipiesIndex[item]) {
      return item + '<hr />' + this.recipiesIndex[item].join('<br />');
    }
    return item;
  }
}
