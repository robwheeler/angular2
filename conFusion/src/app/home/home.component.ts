import { Component, Inject, OnInit } from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { Promotion } from '../shared/promotion';
import { PromotionService } from '../services/promotion.service';
import { Leader } from '../shared/leader';
import { LeaderService } from '../services/leader.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  dish: Dish;
  dishErrMsg: string;
  promotion: Promotion;
  promotionErrMsg: string;
  leader: Leader;
  leaderErrMsg: string;

  constructor(private dishService: DishService,
    @Inject('BaseURL') private BaseURL,
    private leaderService: LeaderService,
    private promotionService: PromotionService) { }

  ngOnInit() {
    this.dishService.getFeaturedDish().subscribe(dish => this.dish = dish,
      errMsg => this.dishErrMsg = <any>errMsg);
    this.promotionService.getFeaturedPromotion().subscribe(promotion => this.promotion = promotion,
      errMsg => this.promotionErrMsg = <any>errMsg);
    this.leaderService.getFeaturedLeader().subscribe(leader => this.leader = leader,
      errMsg => this.leaderErrMsg = <any>errMsg);
  }

}
