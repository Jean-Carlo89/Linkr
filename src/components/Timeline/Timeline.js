import {useContext, useEffect,useState,useRef} from 'react';
import UserContext from '../UserContext';
import OtherUserContext from '../OtherUserContext';
import axios from 'axios';
import {useHistory} from 'react-router-dom';
import TrendingList from '../hashtag/TrendingList';
import NewPost from './NewPost';
import styled from 'styled-components';

import isEqual from 'lodash.isequal';

import getYouTubeID from 'get-youtube-id';

/*import dos Posts*/
import Posts from '../Posts'

/*InfiniteScroller*/
import InfiniteScroll from 'react-infinite-scroller';

/*import de style components*/
import {Title,TimelineContainer,Container,TimelineContent,} from '../timelineStyledComponents'

/* Import UseInterval custom hook*/
import UseInterval from '../UseInterval'

export default function Timeline(){
    const history = useHistory();
    const [likedPosts, setLikedPosts] = useState([]);
    const { user ,setUser} = useContext(UserContext);
    const [allPosts,setAllPosts] = useState([]);
    const [serverLoading,setServerLoading] = useState(true);
    const [olderLikes, setOlderLikes] = useState([]); 
    const inputRef = useRef([]);
    const [numberofFollowing, setNumberofFollowing] = useState([])
    const [timelineRef,setTimelineRef] = useState(false);

    
    const[test,setTest] = useState([])
   
        
    /*Logics of infinite Scroller*/ 
        const [maxNumberOfPosts,setMaxNumberOfPosts] = useState(null)
        const[hasMore,setHasMore] = useState(false)
    const config = {
        headers:{
            'Authorization' : `Bearer ${user.token}`
        }
    }
    
   useEffect(()=>{
        update()        
    },[]);

    useEffect(() => {
        const getNumberofFollowing = axios.get("https://mock-api.bootcamp.respondeai.com.br/api/v2/linkr/users/follows", config)
        getNumberofFollowing.then((response) => setNumberofFollowing(response.data.users))
    },[])

    /*UseInterval(() => {
    
        let idPost = ''
        
        if(allPosts[0]["repostId"]){
             idPost = allPosts[0].repostId
        }else{
            idPost = allPosts[0].id
        }

        const getNewPosts = axios.get(`https://mock-api.bootcamp.respondeai.com.br/api/v2/linkr/following/posts?earlierThan=${idPost}`,config)

    
        getNewPosts.then((response)=>{
            console.log(response)
            console.log('foi!')
            const newerPosts = response.data.posts
            const newTimeline=newerPosts.concat(allPosts)
            console.log('newtimeline')
            console.log(newTimeline)
           setAllPosts([...newTimeline])
        })

        getNewPosts.catch((responseError)=>{
            alert('houve um erro ao atualizar')
            console.log(responseError)

        })

    }, 15000); */


    

    function update () {
        
        const getPosts = axios.get('https://mock-api.bootcamp.respondeai.com.br/api/v2/linkr/following/posts',config)
        setServerLoading(true)
        
        getPosts.then((response)=>{
            const newArray = (response.data.posts.map((p)=>({...p, toEdit: false})));
            console.log(response)

            setAllPosts(newArray)
            setServerLoading(false)
            let sharpedHeart = []
            newArray.forEach( post => {
                post.likes.forEach(n =>{
                if(n.userId === user.user.id){
                    sharpedHeart.push({id: post.id, likes: post.likes.length, names: post.likes.map(n => n["user.username"])})
                }})
            })
            setLikedPosts(sharpedHeart);
            setOlderLikes(sharpedHeart);
        })

        getPosts.catch((responseError)=>{           
            alert(`Houve uma falha ao obter os posts. Por favor atualize a página`)
            return
        })

        setHasMore(true)
    }
        
    function goToLink(e,link){
        e.preventDefault()
        window.open(link)
    }  

    function sendToHashtag(val){
        const newVal = val.replace('#',"")
        history.push(`/hashtag/${newVal}`)
    }

    function goToUserPosts(id){
        if(id!==user.user.id){
        history.push(`/user/${id}`)
        }
        else{
            history.push(`/my-posts`)
        }
    }

    function tryingToEdit(id) {
        let postsToEdit = allPosts.map((p) => {
            if(p.id === id){
                p.toEdit = !p.toEdit;
            }
            return {...p};
        })   
        setAllPosts([...postsToEdit]);

        setTimeout(()=>{

            inputRef.current[id].focus()
           },100
        ) 
    }

    function att2(){
       /* let idPost = ''
        
        if(allPosts[0]["repostId"]){
             idPost = allPosts[0].repostId
        }else{
            idPost = allPosts[0].id
        }*/

        const getNewPosts = axios.get(`https://mock-api.bootcamp.respondeai.com.br/api/v2/linkr/following/posts?earlierThan=${allPosts[0].id}`,config)

    
        getNewPosts.then((response)=>{
            console.log(response)
            console.log('foi!')
            
            const newerPosts = response.data.posts
            
            const newTimeline=newerPosts.concat(allPosts)
            console.log('newtimeline')
            console.log(newTimeline)
           
            setAllPosts([...newTimeline])

        })

        getNewPosts.catch((responseError)=>{
            alert('houve um erro ao atualizar')
            console.log(responseError)

        })
    }

    function scrollPage(lastPost){
        
        //let idPost = ''
       
        
        /*console.log(lastPost)
        console.log(allPosts.length-1)
        
        if(allPosts[lastPost]["repostId"]){
             idPost = allPosts[lastPost].repostId
        }else{
            idPost = allPosts[lastPost].id
        }*/
        
        //console.log(idPost)

        if(allPosts[lastPost]===undefined){
            return
        }

        const getNewPosts = axios.get(`https://mock-api.bootcamp.respondeai.com.br/api/v2/linkr/following/posts?olderThan=${allPosts[lastPost].id}`,config)

        getNewPosts.then((response)=>{
            console.log(response)
            console.log('foi!')

            if(response.data.posts.length<10){
                setHasMore(false)
            }else{
                setHasMore(true)
            }
            
            
            const scrollPosts = response.data.posts
            console.log(scrollPosts)

            setAllPosts([...allPosts,...scrollPosts])
           
        })

        getNewPosts.catch((responseError)=>{
            alert('houve um erro ao atualizar')
            console.log(responseError)

        })

    

       
    }

    return( 
        <Container>
            
            <TimelineContainer>
            <Title><h1>timeline</h1></Title> 
                
                <button onClick={()=>console.log(allPosts)}>see posts state</button>
                <button onClick={att2}>att timeline2</button>
               
                
                    <TimelineContent>
                      
                            <NewPost update={update} />

                            {numberofFollowing.length === 0 ? <NoOneYet> Você ainda não segue ninguem, <br/> procure por perfis na busca </NoOneYet> :
                            <>
                            
                             <InfiniteScroll
                                pageStart={0}
                                loadMore={()=>scrollPage(allPosts.length-1)}
                                hasMore={hasMore}
                                loader={<div className="loader" key={0}>Loading More Posts...</div>}
                                threshold={1}
                                className='Scroller'
                            > 
                              
                                <Posts noPostsMessage={'Quem você segue ainda não publicou nenhum post'}
                                    update={update}
                                    serverLoading={serverLoading}
                                    allPosts={allPosts}
                                    goToUserPosts={goToUserPosts}
                                    olderLikes={olderLikes}
                                    likedPosts={likedPosts}
                                    user={user}
                                    like={like}
                                    tryingToEdit={tryingToEdit}
                                    config={config}
                                    inputRef={inputRef}
                                    goToLink={goToLink}
                                    sendToHashtag={sendToHashtag}
                                />
                                
                             </InfiniteScroll> 
                                    
                            

                            </>}

                        <TrendingList send={sendToHashtag}/>
                    
                    </TimelineContent>
            </TimelineContainer>
                    
        </Container>
    )
                            
                                
                            
    function like (id){
        const config = {
            headers: {
                "Authorization": `Bearer ${user.token}`
            }
        }
        if(likedPosts.map(n => n.id).includes(id)){
            const request = axios.post(`https://mock-api.bootcamp.respondeai.com.br/api/v2/linkr/posts/${id}/dislike`, {}, config)
            request.then(success => {
                setLikedPosts(likedPosts.filter( (n,i) => n.id !== id))
                if(olderLikes.map(n => n.id).includes(id))
                setOlderLikes([... olderLikes.filter( (n,i) => n.id !== id), {id: id, likes: success.data.post.likes.length, names: success.data.post.likes.map(n => n.username)}])
            });
            request.catch(error => alert ("Ocorreu um erro, tente novamente."))
        }
        else{
            const request = axios.post(`https://mock-api.bootcamp.respondeai.com.br/api/v2/linkr/posts/${id}/like`, {}, config)
            request.then(success => {
                setLikedPosts([...likedPosts, {id: id, likes: success.data.post.likes.length, names: success.data.post.likes.map(n => n.username)}])
                if(olderLikes.map(n => n.id).includes(id)){
                    setOlderLikes([...olderLikes.filter( (n,i) => n.id !== id), {id: id, likes: success.data.post.likes.length, names: success.data.post.likes.map(n => n.username)}])
                }
            });
            request.catch(error => alert ("Ocorreu um erro, tente novamente."))
        }
    }
}

const NoOneYet = styled.h1`
    margin-top: 20px;
`;