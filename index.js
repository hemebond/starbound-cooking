var inventory = new Array();
var items_ingredients = new Array();
var items_recipes = new Array();

var effectNames = {
	'health': 'Bonus Health',
	'energy': 'Bonus Energy',
	'burning': 'Burning',
	'jump': 'Jump Boost',
	'nova': 'Nova',
	'thorns': 'Thorns',
	'rage': 'Rage',
	'run': 'Run Boost',
	'poisoned': 'Poisoned',
	'light': 'Light'
}






// Go through all the data and create lists for future use
for (var item in foodItems) {
	if ("ingredients" in foodItems[item]) {
		// create a list of items that are ingredients for other items
		for (ingredient in foodItems[item]['ingredients']) {
			if (items_ingredients.indexOf(ingredient) < 0) {
				items_ingredients.push(ingredient);
			}
		}

		// create a list of recipes (not pure ingredients)
		items_recipes.push(item);

		// add the raw ingredients to the item data
		if (foodItems[item]['rawIngredients'] === undefined) {
			foodItems[item]['rawIngredients'] = getRawIngredients(item);
		}
	}
}
items_ingredients.sort();
items_recipes.sort();



function findRecipe(inventoryItems = []) {
	var matchesFull = [];
	var matchesPartial = [];

	for (var i in items_recipes) {
		var recipeName = items_recipes[i];

		var recipeIngredients = Object.keys(foodItems[recipeName]['ingredients']);
		var rawIngredients = Object.keys(foodItems[recipeName].rawIngredients);

		var partial_match = false;
		var match_tally = 0;

		for (var r=0; r < inventoryItems.length; r++) {
			var ingredient = inventoryItems[r];

			if (recipeIngredients.indexOf(ingredient) >= 0 || rawIngredients.indexOf(ingredient) >= 0) {
				partial_match = true;
				match_tally++;
			}
		}
		if (match_tally == recipeIngredients.length) {
			if (matchesFull.indexOf(recipeName) < 0) {
				matchesFull.push(recipeName);
			}
		}
		else if (partial_match) {
			if (matchesPartial.indexOf(recipeName) < 0) {
				matchesPartial.push(recipeName);
			}
		}
	}

	updateMatchList(matchesFull);
	updatePartialMatchList(matchesPartial);
}


function getRawIngredients(itemName) {
	var ingredients = foodItems[itemName]['ingredients'];
	if (ingredients == undefined) {
		// the item has no ingredients
		return null;
	}

	// store all the raw ingredients here
	var rawIngredients = {};

	for (var ingredient in ingredients) {
		raw = getRawIngredients(ingredient);

		if (raw == null) {
			// the item has no ingredients so just return it as-is
			rawIngredients[ingredient] = (rawIngredients[ingredient] || 0) + ingredients[ingredient];
		}
		else {
			//  go through the raw ingredients of the item and add them to the pile
			for (var rawItem in raw) {
				rawIngredients[rawItem] = (rawIngredients[rawItem] || 0) + raw[rawItem];
			}
		}
	}

	return rawIngredients
}


function updateIngredientItemList() {
	var ingredientButtons = '';

	for (var i=0; i < items_ingredients.length; i++) {
		var ingredientId = items_ingredients[i];

		ingredientButtons += '<a class="list-group-item" data-ingredient="'+ ingredientId +'">\
		                          <img src="images/ingredients/'+ ingredientId +'.png">\
		                          <span>'+ foodItems[ingredientId].name +'</span>\
		                          <i class="glyphicon glyphicon-chevron-right pull-right"></i>\
		                      </a>';
	}

	$('#ingredientItems').html(ingredientButtons);
}
updateIngredientItemList();

$('#ingredientItems').on('click', 'a', function() {
	var itemId = $(this).data('ingredient');
	if (inventory.indexOf(itemId) < 0) {
		inventory.push(itemId);
		updateInventoryList();
	}
});


function updateInventoryList() {
	var buttons = '';
	for (var i=0; i < inventory.length; i++) {
		var itemId = inventory[i];
		var item = foodItems[itemId];
		var itemName = item.name ? item.name : itemId;

		buttons += '<a class="list-group-item" data-ingredient="'+ itemId +'"><img src="images/ingredients/'+ itemId +'.png">'+ itemName +'</a>';
	}

	$('#inventory').html(buttons);
	findRecipe(inventory);
}
$('#inventory').on('click', 'a', function() {
	var itemId = $(this).data('ingredient');
	var index = inventory.indexOf(itemId);
	if (index > -1) {
		inventory.splice(index, 1);
	}
	updateInventoryList();
});


function updateMatchList(recipes) {
	var numOfRecipes = recipes.length;
	var panels = '';

	for (var i=0; i < numOfRecipes; i++) {
		var recipeId = recipes[i];
		panels += makeRecipeCard(recipeId, 'recipesFull')
	}

	$('#recipesFull').html(panels);
}
function updatePartialMatchList(recipes) {
	var numOfRecipes = recipes.length;
	var panels = "";

	for (var i=0; i < numOfRecipes; i++) {
		var recipeId = recipes[i];
		panels += makeRecipeCard(recipeId, 'recipesPartial');
	}

	$('#recipesPartial').html(panels);
}


function makeRecipeCard(recipeId, parentElementId) {
	var recipe = foodItems[recipeId];
	var recipeName = recipe.name ? recipe.name : recipeId;
	var ingredients = Object.keys(recipe.ingredients);
	var rawIngredients = Object.keys(recipe.rawIngredients);
	var panel = '';

	panel += '<div class="panel panel-default">\
	              <div class="panel-heading"\
	                   id="recipe-panel-head-' + recipeId +'"\
	                   role="tab">\
	                  <h4 class="panel-title">\
	                      <a role="button"\
	                         data-toggle="collapse"\
	                         data-parent="#'+ parentElementId +'"\
	                         href="#recipe-panel-body-'+ recipeId +'"\
	                         aria-controls="recipe-panel-body-'+ recipeId +'">\
	                          <img src="images/ingredients/'+ recipeId +'.png">'+ recipeName +'</a>\
	                  </h4>\
	              </div>';

	panel += '<div id="recipe-panel-body-' + recipeId + '"\
	               class="panel-collapse collapse"\
	               role="tabpanel"\
	               aria-labelledby="recipe-panel-head-' + recipeId + '">\
	                   <div class="panel-body">';

	panel += '<div class="panel panel-default">\
	              <div class="panel-heading">\
	                  Status Effects\
	              </div>\
	              <ul class="list-group">';
	for (var effectId in recipe.effects) {
		var effect = recipe.effects[effectId];

		panel += '<li class="list-group-item"><img src="images/effects/'+ effectId +'.png">'+ effectNames[effectId] +' '+ (effect.bonus || '') +' ('+ effect.time +'s)</li>';
	}
	panel += '</ul></div>';

	panel += '             <div class="panel panel-default">\
	                           <div class="panel-heading">\
	                               Ingredients\
	                           </div>\
	                           <ul class="list-group">';
	for (var j=0; j < ingredients.length; j++) {
		var ingredientId = ingredients[j];
		var ingredientName = foodItems[ingredientId].name;
		panel += '<li class="list-group-item"><img src="images/ingredients/' + ingredientId + '.png">' + ingredientName + '</li>';
	}
	panel += '</ul></div>';
	panel += '<div class="panel panel-default">\
	              <div class="panel-heading">\
	                  Raw Ingredients\
	              </div>\
	              <div class="panel-body">\
	                  <p>';
	for (var k=0; k < rawIngredients.length; k++) {
		var rawIngredientId = rawIngredients[k];
		var rawIngredientName = foodItems[rawIngredientId].name;
		panel += '<img alt="'+ rawIngredientName +'" src="images/ingredients/'+ rawIngredients[k] +'.png" title="'+ rawIngredientName +'">';
	}
	panel += '</p></div></div></div></div></div>';

	return panel;
}