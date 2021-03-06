import { Component, OnInit } from '@angular/core';

import { FTText } from './FTFramework/FT-Text';

@Component({
  moduleId: module.id,
  selector: 'ft-footer',
  templateUrl: '../html/footer.html'
})

export class FTFooter {
  texts=[];

  constructor( private text: FTText ) 
  { 
    this.setText();
  }
  
  ngOnInit(): void {
  }    

  private setText(): void {
    this.texts['footer.Code'] = this.text.getText('footer.Code');
    this.texts['footer.Community'] = this.text.getText('footer.Community');
    this.texts['footer.CodeSmall'] = this.text.getText('footer.CodeSmall');
    this.texts['footer.CommunitySmall'] = this.text.getText('footer.CommunitySmall');

    this.texts['footer.CodeLink'] = this.text.getText('footer.CodeLink');
    this.texts['footer.CommunityLink'] = this.text.getText('footer.CommunityLink');
  }
}
