import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { StavkaPorudzbine } from '../../models/stavkaPorudzbine';
import { Observable } from 'rxjs';
import { Porudzbina } from '../../models/porudzbina';
import { StavkaPorudzbineService } from '../../services/stavkaPorudzbine.service';
import { MatDialog, MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { Artikl } from '../../models/artikl';
import { StavkaPorudzbineDialogComponent } from '../dialogs/stavka-porudzbine-dialog/stavka-porudzbine-dialog.component';

@Component({
  selector: 'app-stavka-porudzbine',
  templateUrl: './stavka-porudzbine.component.html',
  styleUrls: ['./stavka-porudzbine.component.css']
})
export class StavkaPorudzbineComponent implements OnInit {

  displayedColumns = ['id', 'redniBroj', 'kolicina', 'jedinicaMere', 'cena', 'porudzbina',
                      'artikl', 'actions'];
  dataSource: MatTableDataSource<StavkaPorudzbine>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @Input() selektovanaPorudzbina: Porudzbina;

  constructor(public stavkaPorudzbineService: StavkaPorudzbineService,
              public dialog: MatDialog) { }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.selektovanaPorudzbina.id) {
      this.loadData();
    }
  }

  public loadData() {
    this.stavkaPorudzbineService.getStavkeZaPorudzbinu(this.selektovanaPorudzbina.id)
    .subscribe(data => {
      this.dataSource = new MatTableDataSource(data);
      //pretraga po nazivu ugnježdenog objekta
      this.dataSource.filterPredicate = (data, filter: string) => {
        const accumulator = (currentTerm, key) => {
          return key === 'artikl' ? currentTerm + data.artikl.naziv : currentTerm +
          data[key];
        };
        const dataStr = Object.keys(data).reduce(accumulator, '').toLowerCase();
        const transformedFilter = filter.trim().toLowerCase();
        return dataStr.indexOf(transformedFilter) !== -1;
     };

      //sortiranje po nazivu ugnježdenog objekta
      this.dataSource.sortingDataAccessor = (data, property) => {
       switch(property) {
         case 'artikl': return data.artikl.naziv.toLocaleLowerCase();
         default: return data[property];
       }
     };

     this.dataSource.paginator = this.paginator;
     this.dataSource.sort = this.sort;
   });

  }

  public openDialog(flag: number, id: number, redniBroj: number, kolicina: number,
                    jedinicaMere: number, cena: number, porudzbina: Porudzbina, 
                    artikl: Artikl) {
      const dialogRef = this.dialog.open(StavkaPorudzbineDialogComponent, {
        data : {
          i: id, id: id, redniBroj: redniBroj, kolicina: kolicina, 
          jedinicaMere: jedinicaMere, cena: cena, porudzbina: porudzbina, artikl: artikl
        }
      });

      dialogRef.componentInstance.flag = flag;
      if(flag == 1)
        dialogRef.componentInstance.data.porudzbina = this.selektovanaPorudzbina;

      dialogRef.afterClosed().subscribe(result => {
        if(result == 1)
          this.loadData();
      });
  }

}
