class FarmingSimulator {
    constructor() {
        this.money = 1000;
        this.seeds = 0;
        this.crops = 0;
        this.level = 1;
        this.maxPlots = 20;
        this.plotSize = 20; // 5x4 = 20 plots initially
        
        this.farmPlots = [];
        this.gameInterval = null;
        
        this.initializeGame();
        this.bindEvents();
        this.startGameLoop();
    }
    
    initializeGame() {
        const farm = document.getElementById('farm');
        farm.innerHTML = '';
        
        this.farmPlots = [];
        for (let i = 0; i < this.plotSize; i++) {
            const plot = document.createElement('div');
            plot.className = 'plot empty';
            plot.dataset.index = i;
            plot.addEventListener('click', (e) => this.handlePlotClick(i));
            farm.appendChild(plot);
            
            this.farmPlots.push({
                state: 'empty',
                plantedTime: 0,
                growthStage: 0
            });
        }
        
        this.updateUI();
    }
    
    bindEvents() {
        document.getElementById('buySeeds').addEventListener('click', () => this.buySeeds());
        document.getElementById('sellCrops').addEventListener('click', () => this.sellCrops());
        document.getElementById('upgradeFarm').addEventListener('click', () => this.upgradeFarm());
    }
    
    buySeeds() {
        if (this.money >= 10) {
            this.money -= 10;
            this.seeds++;
            this.updateUI();
            this.showNotification('✅ Bought 1 seed!');
        } else {
            this.showNotification('❌ Not enough money!');
        }
    }
    
    handlePlotClick(index) {
        const plot = this.farmPlots[index];
        
        switch (plot.state) {
            case 'empty':
                if (this.seeds > 0) {
                    this.plantSeed(index);
                } else {
                    this.showNotification('🌱 No seeds! Buy some first.');
                }
                break;
            case 'growing':
            case 'ready':
                this.harvestCrop(index);
                break;
            case 'seeded':
                this.showNotification('⏳ Still growing...');
                break;
        }
    }
    
    plantSeed(index) {
        this.seeds--;
        this.farmPlots[index] = {
            state: 'seeded',
            plantedTime: Date.now(),
            growthStage: 0
        };
        this.updatePlotUI(index);
        this.updateUI();
        this.showNotification('🌱 Planted a seed!');
    }
    
    harvestCrop(index) {
        this.crops++;
        // Show harvested state, then reset to empty
        this.farmPlots[index].state = 'harvested';
        this.updatePlotUI(index);
        
        setTimeout(() => {
            this.farmPlots[index] = {
                state: 'empty',
                plantedTime: 0,
                growthStage: 0
            };
            this.updatePlotUI(index);
        }, 800); //  harvested animation
        
        this.updateUI();
        this.showNotification('🌾 Harvested 1 crop!');
    }
    
    sellCrops() {
        if (this.crops > 0) {
            const earnings = this.crops * 20;
            const soldAmount = this.crops;
            this.money += earnings;
            this.crops = 0;
            this.updateUI();
            this.showNotification(`💰 Sold ${soldAmount} crops for $${earnings}!`);
        }
    }
    
    upgradeFarm() {
        if (this.money >= 500 && this.level < 5) {
            this.money -= 500;
            this.level++;
            this.plotSize += 5; // Add more plots
            this.maxPlots = Math.min(this.plotSize, 30);
            this.initializeGame();
            this.updateUI();
            this.showNotification(`🚜 Farm upgraded to Level ${this.level}! (+5 plots)`);
        } else if (this.level >= 5) {
            this.showNotification('🏆 Max farm level reached!');
        } else {
            this.showNotification('❌ Need $500 to upgrade!');
        }
    }
    
    updatePlotUI(index) {
        const plotElement = document.querySelector(`[data-index="${index}"]`);
        const plot = this.farmPlots[index];
        
        // Remove all state classes first
        plotElement.className = 'plot';
        
        // Add the current state class
        if (plot.state !== 'empty') {
            plotElement.classList.add(plot.state);
        } else {
            plotElement.classList.add('empty');
        }
        
        
        switch (plot.state) {
            case 'seeded':
                plotElement.innerHTML = '🌱';
                break;
            case 'growing':
                plotElement.innerHTML = '🌿';
                break;
            case 'ready':
                plotElement.innerHTML = '🌾';
                break;
            case 'harvested':
                plotElement.innerHTML = '💰';
                break;
            default:
                plotElement.innerHTML = '';
        }
    }
    
    updateUI() {
        document.getElementById('money').innerHTML = this.money.toLocaleString();
        document.getElementById('seeds').textContent = this.seeds;
        document.getElementById('crops').textContent = this.crops;
        document.getElementById('level').textContent = this.level;
        
        // Update button states
        const sellBtn = document.getElementById('sellCrops');
        const buyBtn = document.getElementById('buySeeds');
        const upgradeBtn = document.getElementById('upgradeFarm');
        
        sellBtn.disabled = this.crops === 0;
        buyBtn.disabled = this.money < 10;
        upgradeBtn.disabled = this.money < 500 || this.level >= 5;
    }
    
    updateGrowth() {
        const now = Date.now();
        let hasUpdates = false;
        
        this.farmPlots.forEach((plot, index) => {
            if (plot.state === 'seeded') {
                const timeGrowing = now - plot.plantedTime;
                
                if (timeGrowing > 2000 && plot.growthStage === 0) {
                    // Stage 1: Growing (2 seconds)
                    plot.state = 'growing';
                    plot.growthStage = 1;
                    this.updatePlotUI(index);
                    hasUpdates = true;
                } 
                else if (timeGrowing > 4000 && plot.growthStage === 1) {
                    // Stage 2: Ready (4 seconds total)
                    plot.state = 'ready';
                    plot.growthStage = 2;
                    this.updatePlotUI(index);
                    hasUpdates = true;
                }
            }
        });
        
        if (hasUpdates) {
            this.updateUI();
        }
    }
    
    startGameLoop() {
        // Update growth every second
        this.gameInterval = setInterval(() => {
            this.updateGrowth();
        }, 1000);
    }
    
    showNotification(message) {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #4CAF50, #45a049);
            color: white;
            padding: 15px 25px;
            border-radius: 25px;
            font-weight: bold;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease, slideOut 0.3s 2.5s ease forwards;
            font-size: 1.1em;
            max-width: 300px;
            text-align: center;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 2800);
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    new FarmingSimulator();
});