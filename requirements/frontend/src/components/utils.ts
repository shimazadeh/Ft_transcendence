const calculRank = (elo: number) => {
    if (elo < 1000)
        return "bronze"
    else if (elo < 2000)
        return "silver"
    else if (elo < 3000)
        return "gold"
    else if (elo < 4000)
        return "crack"
    else
        return "ultimeCrack"
}
export default calculRank