#!/bin/bash
# ============================================================
# ChefConnect — Seed Script v3
# Uses query parameters (not JSON body) to match the API
# Chefs 2-6 only (Anika/Chef 1 already done)
#
# Usage:
#   bash seed_chefconnect_v3.sh
# ============================================================

BASE="http://localhost:8000"

echo "========================================"
echo " ChefConnect Seed Script v3 Starting..."
echo " (Anika already done — starting Chef 2)"
echo "========================================"

step() { echo -e "\n>>> $1"; }


# ════════════════════════════════════════════════════════════
#  CHEF 2 — Marco Ferretti  (Italian & Mediterranean)
# ════════════════════════════════════════════════════════════

step "Chef 2 — Marco Ferretti: Dishes"

curl -s -X POST "$BASE/chefs/2/dishes?dish_name=Tagliatelle+al+Ragu&description=Hand-rolled+fresh+tagliatelle+with+a+slow-cooked+Bolognese+meat+sauce&price=28.00"
curl -s -X POST "$BASE/chefs/2/dishes?dish_name=Cacio+e+Pepe&description=Roman+pasta+with+aged+Pecorino+Romano+and+cracked+black+pepper&price=24.00"
curl -s -X POST "$BASE/chefs/2/dishes?dish_name=Saltimbocca&description=Roman+veal+cutlets+wrapped+in+prosciutto+and+sage+pan-finished+in+white+wine+butter&price=32.00"
curl -s -X POST "$BASE/chefs/2/dishes?dish_name=Branzino+al+Forno&description=Whole+Mediterranean+sea+bass+oven-roasted+with+olive+oil+capers+cherry+tomatoes+and+lemon&price=35.00"
curl -s -X POST "$BASE/chefs/2/dishes?dish_name=Tiramisu&description=Classic+Venetian+tiramisu+with+mascarpone+espresso-soaked+savoiardi+and+cocoa&price=14.00"
curl -s -X POST "$BASE/chefs/2/dishes?dish_name=Focaccia+di+Recco&description=Ligurian+flatbread+stuffed+with+molten+crescenza+cheese+blistered+and+crisp&price=16.00"

step "Chef 2 — Marco Ferretti: Availability"

curl -s -X POST "$BASE/chefs/2/availability?day_of_week=Monday&start_time=17:00&end_time=22:00"
curl -s -X POST "$BASE/chefs/2/availability?day_of_week=Tuesday&start_time=17:00&end_time=22:00"
curl -s -X POST "$BASE/chefs/2/availability?day_of_week=Thursday&start_time=17:00&end_time=22:00"
curl -s -X POST "$BASE/chefs/2/availability?day_of_week=Friday&start_time=17:00&end_time=23:00"
curl -s -X POST "$BASE/chefs/2/availability?day_of_week=Saturday&start_time=09:00&end_time=21:00"
curl -s -X POST "$BASE/chefs/2/availability?day_of_week=Sunday&start_time=12:00&end_time=21:00"

step "Chef 2 — Marco Ferretti: Reviews"

curl -s -X POST "$BASE/reviews?chef_id=2&user_id=10&rating=5&comment=Marco+rolled+fresh+tagliatelle+on+my+counter.+The+ragu+tasted+like+Sunday+at+my+nonnas+house.+Worth+every+dollar."
curl -s -X POST "$BASE/reviews?chef_id=2&user_id=11&rating=5&comment=We+hosted+clients+for+dinner+Marco+handled+the+entire+menu+from+antipasto+to+tiramisu.+Calm+polished+never+in+the+way."
curl -s -X POST "$BASE/reviews?chef_id=2&user_id=12&rating=4&comment=Beautiful+food+and+great+stories.+Slightly+long+prep+time+but+the+result+was+restaurant-quality+at+home."


# ════════════════════════════════════════════════════════════
#  CHEF 3 — Priya Nair  (Indian & South Asian, Vegan-friendly)
# ════════════════════════════════════════════════════════════

step "Chef 3 — Priya Nair: Dishes"

curl -s -X POST "$BASE/chefs/3/dishes?dish_name=Kerala+Fish+Curry&description=Tangy+coconut-milk+fish+curry+with+kodampuli+and+curry+leaves+cooked+the+way+Kerala+intended&price=26.00"
curl -s -X POST "$BASE/chefs/3/dishes?dish_name=Masala+Dosa&description=Crispy+fermented+rice+and+lentil+crepe+filled+with+spiced+potato+masala+served+with+sambar+and+chutneys&price=18.00"
curl -s -X POST "$BASE/chefs/3/dishes?dish_name=Chana+Masala&description=Slow-cooked+chickpeas+in+a+deep+tangy+tomato+and+onion+masala+fully+vegan+and+packed+with+flavour&price=16.00"
curl -s -X POST "$BASE/chefs/3/dishes?dish_name=Vegan+Biryani&description=Fragrant+long-grain+basmati+layered+with+spiced+vegetables+and+whole+spices+slow-cooked+dum+style&price=22.00"
curl -s -X POST "$BASE/chefs/3/dishes?dish_name=Paneer+Butter+Masala&description=Fresh+cottage+cheese+cubes+in+a+velvety+tomato-cream+sauce+with+fenugreek+and+aromatic+spices&price=22.00"
curl -s -X POST "$BASE/chefs/3/dishes?dish_name=Gulab+Jamun&description=Soft+milk-solid+dumplings+soaked+in+rose+and+cardamom+sugar+syrup+the+perfect+Indian+dessert&price=10.00"

step "Chef 3 — Priya Nair: Availability"

curl -s -X POST "$BASE/chefs/3/availability?day_of_week=Monday&start_time=17:00&end_time=21:00"
curl -s -X POST "$BASE/chefs/3/availability?day_of_week=Wednesday&start_time=17:00&end_time=21:00"
curl -s -X POST "$BASE/chefs/3/availability?day_of_week=Thursday&start_time=17:00&end_time=21:00"
curl -s -X POST "$BASE/chefs/3/availability?day_of_week=Saturday&start_time=11:00&end_time=21:00"
curl -s -X POST "$BASE/chefs/3/availability?day_of_week=Sunday&start_time=11:00&end_time=21:00"

step "Chef 3 — Priya Nair: Reviews"

curl -s -X POST "$BASE/reviews?chef_id=3&user_id=13&rating=5&comment=I+am+Malayali+and+Priya+cooked+the+most+authentic+Kerala+fish+curry+I+have+had+in+NYC.+I+almost+cried."
curl -s -X POST "$BASE/reviews?chef_id=3&user_id=14&rating=4&comment=Vegan+biryani+for+a+dinner+party+of+10+everyone+went+back+for+seconds.+Will+definitely+book+again."
curl -s -X POST "$BASE/reviews?chef_id=3&user_id=15&rating=5&comment=Priya+is+warm+organised+and+a+beautiful+cook.+Highly+recommend+for+anyone+craving+home-style+South+Indian+food."


# ════════════════════════════════════════════════════════════
#  CHEF 4 — Kwame Asante  (Ghanaian, Jollof Specialist)
# ════════════════════════════════════════════════════════════

step "Chef 4 — Kwame Asante: Dishes"

curl -s -X POST "$BASE/chefs/4/dishes?dish_name=Ghanaian+Jollof+Rice&description=The+smoky+party-style+jollof+with+the+prized+bottom-of-pot+crust+cooked+over+open+flame&price=22.00"
curl -s -X POST "$BASE/chefs/4/dishes?dish_name=Waakye&description=Rice+and+black-eyed+peas+cooked+with+dried+millet+stalks+served+with+stew+spaghetti+and+shito&price=20.00"
curl -s -X POST "$BASE/chefs/4/dishes?dish_name=Banku+%26+Tilapia&description=Fermented+corn+and+cassava+dough+served+with+whole+grilled+tilapia+and+pepper+sauce&price=28.00"
curl -s -X POST "$BASE/chefs/4/dishes?dish_name=Kelewele&description=Cubed+ripe+plantains+spiced+with+ginger+cayenne+and+cloves+then+fried+golden&price=12.00"
curl -s -X POST "$BASE/chefs/4/dishes?dish_name=Red+Red&description=Black-eyed+pea+stew+cooked+in+palm+oil+with+ripe+plantains+and+smoked+fish&price=18.00"
curl -s -X POST "$BASE/chefs/4/dishes?dish_name=Chichinga+Skewers&description=Ghanaian+spiced+beef+skewers+grilled+over+charcoal+with+groundnut+spice&price=16.00"

step "Chef 4 — Kwame Asante: Availability"

curl -s -X POST "$BASE/chefs/4/availability?day_of_week=Wednesday&start_time=17:00&end_time=22:00"
curl -s -X POST "$BASE/chefs/4/availability?day_of_week=Thursday&start_time=17:00&end_time=22:00"
curl -s -X POST "$BASE/chefs/4/availability?day_of_week=Friday&start_time=17:00&end_time=23:00"
curl -s -X POST "$BASE/chefs/4/availability?day_of_week=Saturday&start_time=09:00&end_time=21:00"
curl -s -X POST "$BASE/chefs/4/availability?day_of_week=Sunday&start_time=12:00&end_time=21:00"

step "Chef 4 — Kwame Asante: Reviews"

curl -s -X POST "$BASE/reviews?chef_id=4&user_id=16&rating=5&comment=I+am+Ghanaian+and+this+man+knows+what+he+is+doing.+The+jollof+had+the+bottom-of-the-pot+smoke+and+everything."
curl -s -X POST "$BASE/reviews?chef_id=4&user_id=17&rating=5&comment=Booked+Kwame+for+a+birthday+dinner.+The+kelewele+alone+was+worth+it+sweet+spicy+perfect."


# ════════════════════════════════════════════════════════════
#  CHEF 5 — Yuki Tanaka  (Japanese, Omakase & Sushi)
# ════════════════════════════════════════════════════════════

step "Chef 5 — Yuki Tanaka: Dishes"

curl -s -X POST "$BASE/chefs/5/dishes?dish_name=Edomae+Sushi&description=Traditional+Tokyo-style+nigiri+hand-pressed+with+vinegared+rice+and+market-fresh+seasonal+fish&price=55.00"
curl -s -X POST "$BASE/chefs/5/dishes?dish_name=Chirashi&description=Scattered+sushi+bowl+with+seasoned+rice+topped+with+sashimi+ikura+and+tamago&price=42.00"
curl -s -X POST "$BASE/chefs/5/dishes?dish_name=Agedashi+Tofu&description=Silken+tofu+in+a+light+dashi+broth+dusted+in+potato+starch+and+fried+until+golden&price=18.00"
curl -s -X POST "$BASE/chefs/5/dishes?dish_name=Miso+Black+Cod&description=Sablefish+marinated+48+hours+in+white+miso+and+mirin+then+broiled+until+caramelised+and+buttery&price=48.00"
curl -s -X POST "$BASE/chefs/5/dishes?dish_name=Wagyu+Tataki&description=A5+Wagyu+briefly+seared+sliced+thin+and+served+with+ponzu+grated+daikon+and+microgreens&price=52.00"
curl -s -X POST "$BASE/chefs/5/dishes?dish_name=Matcha+Mochi&description=Hand-made+rice-cake+filled+with+sweetened+matcha+cream+the+perfect+finish+to+an+omakase+dinner&price=14.00"

step "Chef 5 — Yuki Tanaka: Availability"

curl -s -X POST "$BASE/chefs/5/availability?day_of_week=Tuesday&start_time=18:00&end_time=22:00"
curl -s -X POST "$BASE/chefs/5/availability?day_of_week=Wednesday&start_time=18:00&end_time=22:00"
curl -s -X POST "$BASE/chefs/5/availability?day_of_week=Thursday&start_time=18:00&end_time=22:00"
curl -s -X POST "$BASE/chefs/5/availability?day_of_week=Friday&start_time=18:00&end_time=23:00"
curl -s -X POST "$BASE/chefs/5/availability?day_of_week=Saturday&start_time=17:00&end_time=23:00"

step "Chef 5 — Yuki Tanaka: Reviews"

curl -s -X POST "$BASE/reviews?chef_id=5&user_id=18&rating=5&comment=Quiet+focused+exact.+Yuki+turned+my+kitchen+into+a+tiny+omakase+counter+for+six+people.+Unforgettable."
curl -s -X POST "$BASE/reviews?chef_id=5&user_id=19&rating=5&comment=Best+fish+I+have+eaten+outside+of+Japan.+She+brings+the+entire+experience."


# ════════════════════════════════════════════════════════════
#  CHEF 6 — Diego Vargas  (Mexican & Colombian, Pantry Chef)
# ════════════════════════════════════════════════════════════

step "Chef 6 — Diego Vargas: Dishes"

curl -s -X POST "$BASE/chefs/6/dishes?dish_name=Mole+Poblano&description=Complex+slow-built+mole+with+dried+chiles+dark+chocolate+and+30+ingredients+served+over+chicken&price=32.00"
curl -s -X POST "$BASE/chefs/6/dishes?dish_name=Arepas+con+Queso&description=Hand-pressed+Colombian+cornmeal+cakes+griddled+until+crisp+outside+soft+inside+stuffed+with+melted+cheese&price=14.00"
curl -s -X POST "$BASE/chefs/6/dishes?dish_name=Sancocho&description=Hearty+Colombian+seven-meat+stew+with+yuca+corn+and+plantain+slow-cooked+and+deeply+comforting&price=28.00"
curl -s -X POST "$BASE/chefs/6/dishes?dish_name=Tacos+al+Pastor&description=Marinated+pork+on+fresh+hand-pressed+tortillas+with+pineapple+onion+and+cilantro&price=22.00"
curl -s -X POST "$BASE/chefs/6/dishes?dish_name=Bandeja+Paisa&description=The+Colombian+platter+with+red+beans+white+rice+chicharron+chorizo+fried+egg+avocado+and+sweet+plantain&price=30.00"
curl -s -X POST "$BASE/chefs/6/dishes?dish_name=Tres+Leches&description=Sponge+cake+soaked+in+three+milks+topped+with+whipped+cream+and+cinnamon&price=12.00"

step "Chef 6 — Diego Vargas: Availability"

curl -s -X POST "$BASE/chefs/6/availability?day_of_week=Monday&start_time=17:00&end_time=22:00"
curl -s -X POST "$BASE/chefs/6/availability?day_of_week=Tuesday&start_time=17:00&end_time=22:00"
curl -s -X POST "$BASE/chefs/6/availability?day_of_week=Thursday&start_time=17:00&end_time=22:00"
curl -s -X POST "$BASE/chefs/6/availability?day_of_week=Friday&start_time=17:00&end_time=23:00"
curl -s -X POST "$BASE/chefs/6/availability?day_of_week=Saturday&start_time=09:00&end_time=21:00"
curl -s -X POST "$BASE/chefs/6/availability?day_of_week=Sunday&start_time=12:00&end_time=21:00"

step "Chef 6 — Diego Vargas: Reviews"

curl -s -X POST "$BASE/reviews?chef_id=6&user_id=20&rating=5&comment=Diego+came+over+with+almost+nothing+and+built+a+full+Colombian+Sunday+lunch+from+what+I+had.+Magic."
curl -s -X POST "$BASE/reviews?chef_id=6&user_id=21&rating=5&comment=Hired+him+for+a+tacos-and-mezcal+night+for+friends.+Fresh+tortillas+three+salsas+total+pro."
curl -s -X POST "$BASE/reviews?chef_id=6&user_id=22&rating=4&comment=Excellent+flavors+slightly+heavy+on+the+spice+for+kids+but+he+adjusted+instantly+when+I+asked."


echo ""
echo "========================================"
echo " Seed complete! Verify with:"
echo " SELECT * FROM Dish WHERE chef_id = 2;"
echo " SELECT * FROM ChefAvailability WHERE chef_id = 2;"
echo " SELECT * FROM Review WHERE chef_id = 2;"
echo "========================================"
